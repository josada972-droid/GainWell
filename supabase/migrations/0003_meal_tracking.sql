-- Stage 4: meal tracking — custom foods, daily meals and entries, saved meals,
-- and the shared Open Food Facts caches plus the shared rate limiter.
--
-- Snapshot model (docs/supabase.md §9):
-- * meal_entries / saved_meal_entries store TWO copies of nutrition data:
--   - `source_*` — the immutable original values and basis the entry was
--     created from. Clients cannot update them (column grants); the app never
--     rewrites them. Quantity edits recalculate `calc_*` from `source_*`
--     alone, so history never depends on a live Open Food Facts record or a
--     custom food's current values.
--   - `calc_*` — the values for the recorded quantity, derived from source_*.
--     Unknown nutrients stay NULL (never 0) and `calc_complete` records
--     whether all five were known.
--
-- Security model, same conventions as 0001/0002 (docs/supabase.md):
-- * Every user-owned table has `user_id` NOT NULL, a FK to auth.users on
--   delete cascade, and RLS limited to auth.uid() = user_id.
-- * Child tables carry a composite FK `(meal_id, user_id) → meals (id,
--   user_id)`: a row can only reference its own user's parent. The parent
--   tables carry a matching `unique (id, user_id)` for this.
-- * Deletion of entries goes through narrowly scoped SECURITY DEFINER
--   functions (no DELETE policies, matching the architecture's stance).
-- * The OFF caches are shared and server-managed: authenticated users may
--   SELECT only, and only the privileged server client writes.
-- * `off_rate_limit` is internal state; clients get no grants at all — the
--   SECURITY DEFINER limiter function is the only path.

-- ---------------------------------------------------------------------------
-- custom_foods — foods a user created themselves. Never mixed with OFF data.
-- ---------------------------------------------------------------------------
create table public.custom_foods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,

  name text not null check (char_length(btrim(name)) between 1 and 120),
  brand text check (brand is null or char_length(btrim(brand)) between 1 and 80),

  -- Per-basis values. NULL means "unknown" and is never read as zero.
  kcal_per_100g numeric(8, 3) check (kcal_per_100g is null or kcal_per_100g >= 0),
  protein_per_100g numeric(8, 3) check (protein_per_100g is null or protein_per_100g >= 0),
  carbs_per_100g numeric(8, 3) check (carbs_per_100g is null or carbs_per_100g >= 0),
  fat_per_100g numeric(8, 3) check (fat_per_100g is null or fat_per_100g >= 0),
  fiber_per_100g numeric(8, 3) check (fiber_per_100g is null or fiber_per_100g >= 0),

  -- Explicit basis. 'per_100g': values are per 100 grams, entries are logged
  -- in grams. 'per_serving': the values describe ONE serving and entries are
  -- logged in servings. No millilitre basis for user input: without a
  -- density there is no honest way to convert ml to grams.
  nutrition_basis text not null default 'per_100g'
    check (nutrition_basis in ('per_100g', 'per_serving')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- At least one nutrient value: a food with no numbers at all is unusable.
  check (
    kcal_per_100g is not null or protein_per_100g is not null
    or carbs_per_100g is not null or fat_per_100g is not null
    or fiber_per_100g is not null
  )
);

comment on table public.custom_foods is
  'User-created foods. Owner-only via RLS. Nullable nutrients mean unknown, '
  'never zero; basis is explicit (per 100 g or per single serving).';
comment on column public.custom_foods.nutrition_basis is
  'The basis the entered values describe: per 100 g, or per one serving.';

create trigger custom_foods_touch_updated_at
  before update on public.custom_foods
  for each row
  execute function public.touch_updated_at();

create index custom_foods_user_idx on public.custom_foods (user_id, name);

-- ---------------------------------------------------------------------------
-- meals — the day container. Values never change after creation, so there is
-- deliberately no UPDATE policy and no UPDATE grant.
-- ---------------------------------------------------------------------------
create table public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  meal_date date not null
    check (meal_date between date '2000-01-01' and date '2100-12-31'),
  meal_type text not null
    check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- One container per user/date/type; duplicates are refused by the DB.
  unique (user_id, meal_date, meal_type),
  -- Referenced by the composite child FK below.
  unique (id, user_id)
);

comment on table public.meals is
  'A meal container for one user, date and type. Immutable: entries carry the '
  'content, the container only groups them.';

create index meals_user_date_idx on public.meals (user_id, meal_date);

create trigger meals_touch_updated_at
  before update on public.meals
  for each row
  execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- meal_entries — one food item in a meal.
-- ---------------------------------------------------------------------------
create table public.meal_entries (
  id uuid primary key default gen_random_uuid(),
  meal_id uuid not null,
  user_id uuid not null references auth.users (id) on delete cascade,

  -- Composite FK: the entry can only ever point at its own user's meal, so a
  -- cross-user attach is rejected by the database, not just the app.
  foreign key (meal_id, user_id) references public.meals (id, user_id)
    on delete cascade,

  food_source text not null check (food_source in ('open_food_facts', 'custom')),
  off_product_code text
    check (off_product_code is null or char_length(off_product_code) between 1 and 40),
  custom_food_id uuid,
  -- Provenance pointer to public.custom_foods(id), deliberately WITHOUT a
  -- foreign key: historical entries must survive the source record becoming
  -- unavailable, and ON DELETE SET NULL would contradict the CHECK above
  -- while CASCADE would destroy history (docs/supabase.md §9). The engine
  -- never re-reads this row; the snapshots below carry everything.
  check (
    (food_source = 'open_food_facts' and off_product_code is not null
       and custom_food_id is null)
    or (food_source = 'custom' and custom_food_id is not null
       and off_product_code is null)
  ),

  -- The name/brand as seen when the entry was created — history stays
  -- readable even if the source product or custom food changes name later.
  food_name_snapshot text not null
    check (char_length(btrim(food_name_snapshot)) between 1 and 120),
  brand_snapshot text
    check (brand_snapshot is null or char_length(btrim(brand_snapshot)) between 1 and 80),

  -- --- Immutable source nutrition (written at insert; never updatable) ---
  source_kcal numeric(9, 3),
  source_protein_g numeric(9, 3),
  source_carbs_g numeric(9, 3),
  source_fat_g numeric(9, 3),
  source_fiber_g numeric(9, 3),
  source_basis text not null
    check (source_basis in ('per_100g', 'per_100ml', 'per_serving')),
  -- Serving size where the source supplied one (per_serving basis).
  source_serving_quantity numeric(9, 3),
  source_serving_unit text
    check (source_serving_unit is null or source_serving_unit in ('g', 'ml', 'serving')),
  -- Attribution where required (e.g. the Open Food Facts product URL).
  source_attribution text
    check (source_attribution is null or char_length(source_attribution) <= 400),

  -- --- The recorded quantity ---
  quantity numeric(9, 3) not null check (quantity > 0 and quantity <= 100000),
  quantity_unit text not null check (quantity_unit in ('g', 'ml', 'serving')),

  -- --- Calculated snapshot for that quantity (nullable = unknown) ---
  calc_kcal numeric(10, 3),
  calc_protein_g numeric(10, 3),
  calc_carbs_g numeric(10, 3),
  calc_fat_g numeric(10, 3),
  calc_fiber_g numeric(10, 3),
  -- Grams the calculation produced; NULL when the unit/basis pair does not
  -- determine a mass (e.g. ml without a density) — never a guess.
  calc_grams numeric(10, 3),
  -- True when every source nutrient value was known at insert time.
  calc_complete boolean not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  check (source_serving_unit is null or source_serving_quantity is not null),
  check (
    calc_kcal is null or calc_protein_g is null or calc_carbs_g is null
    or calc_fat_g is null or calc_fiber_g is null
    or calc_complete = true
  )
);

comment on table public.meal_entries is
  'One food in a meal. source_* is the immutable original nutrition; calc_* is '
  'the values for the recorded quantity, recomputed from source_* only. '
  'Unknown nutrients are NULL, never zero.';
comment on column public.meal_entries.custom_food_id is
  'Provenance pointer to custom_foods(id) with no FK: history outlives the '
  'source row. Never re-read for calculations.';

create index meal_entries_meal_idx on public.meal_entries (meal_id);
create index meal_entries_user_idx on public.meal_entries (user_id);

create trigger meal_entries_touch_updated_at
  before update on public.meal_entries
  for each row
  execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- saved_meals + saved_meal_entries — reusable meal templates with the same
-- two-layer snapshot model. Applying one to a day copies the snapshots into
-- NEW meal_entries; daily records never depend on a mutable saved meal.
-- ---------------------------------------------------------------------------
create table public.saved_meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 120),
  description text
    check (description is null or char_length(btrim(description)) between 1 and 300),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (id, user_id)
);

create index saved_meals_user_idx on public.saved_meals (user_id);

create trigger saved_meals_touch_updated_at
  before update on public.saved_meals
  for each row
  execute function public.touch_updated_at();

create table public.saved_meal_entries (
  id uuid primary key default gen_random_uuid(),
  saved_meal_id uuid not null,
  user_id uuid not null references auth.users (id) on delete cascade,

  foreign key (saved_meal_id, user_id) references public.saved_meals (id, user_id)
    on delete cascade,

  food_source text not null check (food_source in ('open_food_facts', 'custom')),
  off_product_code text
    check (off_product_code is null or char_length(off_product_code) between 1 and 40),
  custom_food_id uuid, -- provenance pointer, see meal_entries

  food_name_snapshot text not null
    check (char_length(btrim(food_name_snapshot)) between 1 and 120),
  brand_snapshot text
    check (brand_snapshot is null or char_length(btrim(brand_snapshot)) between 1 and 80),

  source_kcal numeric(9, 3),
  source_protein_g numeric(9, 3),
  source_carbs_g numeric(9, 3),
  source_fat_g numeric(9, 3),
  source_fiber_g numeric(9, 3),
  source_basis text not null
    check (source_basis in ('per_100g', 'per_100ml', 'per_serving')),
  source_serving_quantity numeric(9, 3),
  source_serving_unit text
    check (source_serving_unit is null or source_serving_unit in ('g', 'ml', 'serving')),
  source_attribution text
    check (source_attribution is null or char_length(source_attribution) <= 400),

  quantity numeric(9, 3) not null check (quantity > 0 and quantity <= 100000),
  quantity_unit text not null check (quantity_unit in ('g', 'ml', 'serving')),

  calc_kcal numeric(10, 3),
  calc_protein_g numeric(10, 3),
  calc_carbs_g numeric(10, 3),
  calc_fat_g numeric(10, 3),
  calc_fiber_g numeric(10, 3),
  calc_grams numeric(10, 3),
  calc_complete boolean not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  check (source_serving_unit is null or source_serving_quantity is not null),
  check (
    (food_source = 'open_food_facts' and off_product_code is not null
       and custom_food_id is null)
    or (food_source = 'custom' and custom_food_id is not null
       and off_product_code is null)
  )
);

comment on table public.saved_meal_entries is
  'Snapshot copies of the entries captured when a meal was saved; the same '
  'immutable-source / calculated-snapshot model as meal_entries.';

create index saved_meal_entries_meal_idx on public.saved_meal_entries (saved_meal_id);
create index saved_meal_entries_user_idx on public.saved_meal_entries (user_id);

create trigger saved_meal_entries_touch_updated_at
  before update on public.saved_meal_entries
  for each row
  execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Shared Open Food Facts caches. Public data with attribution, but written
-- only by the privileged server client; users read, never write.
-- ---------------------------------------------------------------------------
create table public.off_products_cache (
  id uuid primary key default gen_random_uuid(),
  barcode text not null unique
    check (char_length(barcode) between 1 and 40 and barcode ~ '^[0-9]+$'),
  product_name text,
  brand text,
  kcal_per_100g numeric(9, 3),
  protein_per_100g numeric(9, 3),
  carbs_per_100g numeric(9, 3),
  fat_per_100g numeric(9, 3),
  fiber_per_100g numeric(9, 3),
  nutrition_basis text not null
    check (nutrition_basis in ('per_100g', 'per_100ml', 'per_serving')),
  serving_quantity numeric(9, 3),
  serving_unit text
    check (serving_unit is null or serving_unit in ('g', 'ml', 'serving')),
  -- Attribution: the Open Food Facts product page URL.
  off_url text not null check (char_length(off_url) <= 400),
  -- The product's own last-modified timestamp, when OFF supplied one.
  source_updated_at timestamptz,
  cached_at timestamptz not null default now(),
  expires_at timestamptz not null,
  check (expires_at > cached_at)
);

comment on table public.off_products_cache is
  'Server-managed cache of Open Food Facts products (ODbL data, attributed '
  'per row). Ordinary roles can only SELECT; writes go through the '
  'privileged server client. Never holds custom user foods.';

create index off_products_cache_expires_idx on public.off_products_cache (expires_at);

create table public.off_search_cache (
  id uuid primary key default gen_random_uuid(),
  -- Normalized query (trimmed, lowercased, whitespace folded) — the cache key.
  query_hash text not null unique
    check (char_length(query_hash) between 1 and 200),
  query text not null check (char_length(query) between 1 and 200),
  results jsonb not null,
  cached_at timestamptz not null default now(),
  expires_at timestamptz not null,
  check (expires_at > cached_at)
);

comment on table public.off_search_cache is
  'Server-managed cache of Open Food Facts search results keyed by a '
  'normalized query. Same permissions as off_products_cache.';

create index off_search_cache_expires_idx on public.off_search_cache (expires_at);

create table public.off_rate_limit (
  bucket text not null,
  window_start timestamptz not null,
  used integer not null default 0,
  primary key (bucket, window_start)
);

comment on table public.off_rate_limit is
  'Shared outbound-request budget for Open Food Facts (no personal data). '
  'Only the SECURITY DEFINER limiter function touches it.';

-- ---------------------------------------------------------------------------
-- RLS. User-owned tables: owner-only. Caches: authenticated read-only.
-- ---------------------------------------------------------------------------
alter table public.custom_foods enable row level security;
alter table public.meals enable row level security;
alter table public.meal_entries enable row level security;
alter table public.saved_meals enable row level security;
alter table public.saved_meal_entries enable row level security;
alter table public.off_products_cache enable row level security;
alter table public.off_search_cache enable row level security;

create policy "custom_foods_select_own" on public.custom_foods
  for select to authenticated using (auth.uid() = user_id);
create policy "custom_foods_insert_own" on public.custom_foods
  for insert to authenticated with check (auth.uid() = user_id);
create policy "custom_foods_update_own" on public.custom_foods
  for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "meals_select_own" on public.meals
  for select to authenticated using (auth.uid() = user_id);
create policy "meals_insert_own" on public.meals
  for insert to authenticated with check (auth.uid() = user_id);
-- No UPDATE policy: a meal container has no mutable user-facing fields.

create policy "meal_entries_select_own" on public.meal_entries
  for select to authenticated using (auth.uid() = user_id);
create policy "meal_entries_insert_own" on public.meal_entries
  for insert to authenticated with check (auth.uid() = user_id);
create policy "meal_entries_update_own" on public.meal_entries
  for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- No DELETE policy: entries are removed via public.delete_meal_entry below.

create policy "saved_meals_select_own" on public.saved_meals
  for select to authenticated using (auth.uid() = user_id);
create policy "saved_meals_insert_own" on public.saved_meals
  for insert to authenticated with check (auth.uid() = user_id);
create policy "saved_meals_update_own" on public.saved_meals
  for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- No DELETE policy: saved meals are removed via public.delete_saved_meal.

create policy "saved_meal_entries_select_own" on public.saved_meal_entries
  for select to authenticated using (auth.uid() = user_id);
create policy "saved_meal_entries_insert_own" on public.saved_meal_entries
  for insert to authenticated with check (auth.uid() = user_id);
create policy "saved_meal_entries_update_own" on public.saved_meal_entries
  for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Shared caches: signed-in users read the food data they searched for; no
-- write path exists for any ordinary role.
create policy "off_products_cache_select" on public.off_products_cache
  for select to authenticated using (true);
create policy "off_search_cache_select" on public.off_search_cache
  for select to authenticated using (true);

-- ---------------------------------------------------------------------------
-- Privilege layer on top of RLS (the 0001/0002 pattern: narrow the write
-- surface so even a policy bug cannot let a user write what it must not).
-- ---------------------------------------------------------------------------
revoke update on table public.custom_foods from anon, authenticated;
grant update (
  name, brand,
  kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g,
  fiber_per_100g, nutrition_basis
) on table public.custom_foods to authenticated;
-- No client deletes custom foods in Stage 4 (no DELETE policy, no feature);
-- keep the table strictly insert/select/update for ordinary roles.
revoke insert, delete on table public.custom_foods from anon, authenticated;
grant insert (user_id, name, brand, kcal_per_100g, protein_per_100g,
  carbs_per_100g, fat_per_100g, fiber_per_100g, nutrition_basis)
  on table public.custom_foods to authenticated;

revoke update, delete on table public.meals from anon, authenticated;
revoke insert on table public.meals from anon;
grant insert (user_id, meal_date, meal_type) on table public.meals to authenticated;

revoke update on table public.meal_entries from anon, authenticated;
-- quantity/quantity_unit are the user-editable fields; calc_* are the derived
-- snapshot the app rewrites from the entry's own source_* on a quantity edit.
-- source_* are NOT granted: the immutable original values can never change.
grant update (
  quantity, quantity_unit,
  calc_kcal, calc_protein_g, calc_carbs_g, calc_fat_g, calc_fiber_g,
  calc_grams, calc_complete
) on table public.meal_entries to authenticated;
-- Removal goes through public.delete_meal_entry (SECURITY DEFINER), never a
-- client DELETE.
revoke insert, delete on table public.meal_entries from anon, authenticated;
grant insert (meal_id, user_id, food_source, off_product_code, custom_food_id,
  food_name_snapshot, brand_snapshot, source_kcal, source_protein_g,
  source_carbs_g, source_fat_g, source_fiber_g, source_basis,
  source_serving_quantity, source_serving_unit, source_attribution,
  quantity, quantity_unit, calc_kcal, calc_protein_g, calc_carbs_g,
  calc_fat_g, calc_fiber_g, calc_grams, calc_complete)
  on table public.meal_entries to authenticated;

revoke update on table public.saved_meals from anon, authenticated;
grant update (name, description) on table public.saved_meals to authenticated;
revoke insert, delete on table public.saved_meals from anon, authenticated;
grant insert (user_id, name, description) on table public.saved_meals to authenticated;

revoke update on table public.saved_meal_entries from anon, authenticated;
-- Same shape as meal_entries: quantity + calc_* updatable, source_* immutable.
grant update (
  quantity, quantity_unit,
  calc_kcal, calc_protein_g, calc_carbs_g, calc_fat_g, calc_fiber_g,
  calc_grams, calc_complete
) on table public.saved_meal_entries to authenticated;
revoke insert, delete on table public.saved_meal_entries from anon, authenticated;
grant insert (saved_meal_id, user_id, food_source, off_product_code,
  custom_food_id, food_name_snapshot, brand_snapshot, source_kcal,
  source_protein_g, source_carbs_g, source_fat_g, source_fiber_g,
  source_basis, source_serving_quantity, source_serving_unit,
  source_attribution, quantity, quantity_unit, calc_kcal, calc_protein_g,
  calc_carbs_g, calc_fat_g, calc_fiber_g, calc_grams, calc_complete)
  on table public.saved_meal_entries to authenticated;

-- Caches: no client writes, ever.
revoke insert, update, delete on table public.off_products_cache from anon, authenticated;
revoke insert, update, delete on table public.off_search_cache from anon, authenticated;

-- Rate-limit state: clients get nothing at all; the function is the only path.
revoke select, insert, update, delete on table public.off_rate_limit
  from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Deletion functions. No DELETE policies exist (the architecture's stance),
-- so these narrowly scoped SECURITY DEFINER functions are the only way an
-- entry or saved meal is removed. Each one:
-- * fails safe (returns 0) when there is no authenticated identity,
-- * deletes only rows whose user_id equals auth.uid(),
-- * has an empty search_path and only schema-qualified references.
-- Rows deleted: exactly the caller's own. Cross-user ids delete nothing.
-- ---------------------------------------------------------------------------
create or replace function public.delete_meal_entry(p_entry_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_deleted integer;
begin
  if auth.uid() is null then
    return 0;
  end if;
  delete from public.meal_entries
  where id = p_entry_id and user_id = auth.uid();
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

create or replace function public.delete_saved_meal_entry(p_entry_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_deleted integer;
begin
  if auth.uid() is null then
    return 0;
  end if;
  delete from public.saved_meal_entries
  where id = p_entry_id and user_id = auth.uid();
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

create or replace function public.delete_saved_meal(p_saved_meal_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_deleted integer;
begin
  if auth.uid() is null then
    return 0;
  end if;
  delete from public.saved_meals
  where id = p_saved_meal_id and user_id = auth.uid();
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

revoke all on function public.delete_meal_entry(uuid) from public, anon;
revoke all on function public.delete_saved_meal_entry(uuid) from public, anon;
revoke all on function public.delete_saved_meal(uuid) from public, anon;
grant execute on function public.delete_meal_entry(uuid) to authenticated;
grant execute on function public.delete_saved_meal_entry(uuid) to authenticated;
grant execute on function public.delete_saved_meal(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Shared rate limiter. One atomic statement per take: insert the current
-- window row or increment it, and report whether the caller is still inside
-- the limit. Concurrent calls serialize on the primary key, so two
-- application instances can never both spend the same token (the spec's
-- requirement for serverless deployments). Window start is anchored to the
-- epoch so every instance computes the same row. Old windows are dropped as
-- a bounded cleanup inside the same call.
-- ---------------------------------------------------------------------------
create or replace function public.off_rate_limit_take(
  p_bucket text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_window timestamptz;
  v_used integer;
begin
  if p_limit is null or p_limit < 1 or p_window_seconds is null
     or p_window_seconds < 1 or p_bucket is null then
    return false; -- malformed configuration fails closed
  end if;

  v_window := to_timestamp(
    floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds
  );

  insert into public.off_rate_limit (bucket, window_start, used)
  values (p_bucket, v_window, 1)
  on conflict (bucket, window_start)
    do update set used = public.off_rate_limit.used + 1
  returning used into v_used;

  -- Opportunistic cleanup of finished windows (bounded by the PK pattern).
  delete from public.off_rate_limit
  where window_start < v_window - p_window_seconds * interval '1 second' * 4;

  return v_used <= p_limit;
end;
$$;

revoke all on function public.off_rate_limit_take(text, integer, integer)
  from public, anon;
grant execute on function public.off_rate_limit_take(text, integer, integer)
  to authenticated;
