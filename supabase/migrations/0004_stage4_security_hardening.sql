-- Stage 4 security hardening & integrity pass (forward-only; 0003 stays as applied).
--
-- What this migration changes, and why:
--
-- 1. Rate limiter: `off_rate_limit_take(bucket, limit, window_seconds)` let any
--    authenticated caller pick the bucket, the limit and the window, so a user
--    could poison shared buckets or raise their own budget. It is replaced by
--    `off_rate_limit_take(bucket)` — approved buckets only, limits and window
--    fixed inside the function — executable by service_role alone (the server
--    module is the only caller). The shared/global behavior is unchanged: one
--    atomic INSERT … ON CONFLICT DO UPDATE … RETURNING per take.
-- 2. OFF caches: authenticated users could SELECT every cached product and
--    every normalized search query (which reveals what foods a person looks
--    for). SELECT is revoked and the `USING (true)` policies are dropped; the
--    caches become server-internal state, reachable only through the
--    privileged server client.
-- 3. Entry snapshots: authenticated clients could INSERT fabricated source
--    snapshots and UPDATE calc_*/quantity_unit directly through PostgREST.
--    INSERT and UPDATE are revoked for ordinary roles on both entry tables —
--    the application writes them with the privileged client after verifying
--    the session and ownership under RLS. SELECT stays owner-only.
-- 4. Integrity: `calc_*` is DERIVED by a trigger from the immutable `source_*`
--    plus the recorded quantity/unit (the same rules as
--    src/lib/nutrition/food.ts: no g↔ml conversion, unknown stays NULL),
--    `calc_complete` now means exactly "all five calculated values present",
--    nutrients are nonnegative, serving quantities positive, and the
--    unit↔basis pair must match. Source snapshot columns and `quantity_unit`
--    are refused on UPDATE.
--
-- Existing rows were checked against every new constraint before writing it:
-- zero violations (3 entries total in the local DB), so nothing was rewritten
-- and no data was altered. The only rows removed are expired rate-limit
-- window counters left over from earlier limiter tests — shared bookkeeping,
-- not user data, and the limiter deletes old windows itself.

-- ---------------------------------------------------------------------------
-- 1. Rate limiter: fixed policy inside the function, service-role only.
-- ---------------------------------------------------------------------------
drop function if exists public.off_rate_limit_take(text, integer, integer);

-- Mirrors the limiter's own bounded cleanup: window rows older than five
-- minutes are already spent and would only block a new bucket CHECK.
delete from public.off_rate_limit
where window_start < now() - interval '5 minutes';

alter table public.off_rate_limit
  add constraint off_rate_limit_bucket_check
    check (bucket in ('search', 'product'));

comment on constraint off_rate_limit_bucket_check on public.off_rate_limit is
  'Only the two approved buckets exist; the limiter function is the only writer.';

-- Not STRICT: a NULL bucket must reach the body and be refused explicitly
-- rather than returning SQL NULL (which the caller also treats as a denial).
create or replace function public.off_rate_limit_take(p_bucket text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  -- The budget is configured HERE, never by the caller. Official per-IP
  -- maxima are 10 search / 15 product requests per minute; GainWell stays
  -- below them with headroom for traffic sharing the same IP.
  v_limit integer;
  v_window_seconds integer := 60;
  v_window_start timestamptz;
  v_used integer;
begin
  if p_bucket = 'search' then
    v_limit := 6;
  elsif p_bucket = 'product' then
    v_limit := 10;
  else
    return false; -- unknown bucket: refused, and no row is created
  end if;

  v_window_start := to_timestamp(
    floor(extract(epoch from now()) / v_window_seconds) * v_window_seconds
  );

  insert into public.off_rate_limit (bucket, window_start, used)
  values (p_bucket, v_window_start, 1)
  on conflict (bucket, window_start)
    do update set used = public.off_rate_limit.used + 1
    where public.off_rate_limit.used < v_limit
  returning used into v_used;

  -- A spent window updates nothing, so RETURNING yields NULL: refuse, and the
  -- counter never grows past the limit.
  if v_used is null then
    return false;
  end if;

  -- Growth stays bounded: at most a few windows per approved bucket.
  delete from public.off_rate_limit
  where window_start < v_window_start - interval '1 minute' * 4;

  return v_used <= v_limit;
end;
$$;

comment on function public.off_rate_limit_take(text) is
  'Shared outbound budget for Open Food Facts. service_role only; approved '
  'buckets only (search 6/min, product 10/min); limits fixed in the function.';

revoke all on function public.off_rate_limit_take(text)
  from public, anon, authenticated;
grant execute on function public.off_rate_limit_take(text) to service_role;

-- ---------------------------------------------------------------------------
-- 2. OFF caches: no ordinary-role access path at all.
-- ---------------------------------------------------------------------------
drop policy "off_products_cache_select" on public.off_products_cache;
drop policy "off_search_cache_select" on public.off_search_cache;

revoke select on table public.off_products_cache from anon, authenticated;
revoke select on table public.off_search_cache from anon, authenticated;

comment on table public.off_products_cache is
  'Server-managed cache of Open Food Facts products (ODbL data, attributed '
  'per row). No ordinary role can read or write it; the privileged server '
  'client is the only access path.';
comment on table public.off_search_cache is
  'Server-managed cache of Open Food Facts search results keyed by a '
  'normalized query hash. The plaintext query is personal-interest data, so '
  'no ordinary role may read it.';

-- ---------------------------------------------------------------------------
-- 3. Entry writes: ordinary roles read only; the server writes.
-- ---------------------------------------------------------------------------
drop policy "meal_entries_insert_own" on public.meal_entries;
drop policy "meal_entries_update_own" on public.meal_entries;
drop policy "saved_meal_entries_insert_own" on public.saved_meal_entries;
drop policy "saved_meal_entries_update_own" on public.saved_meal_entries;

revoke insert, update on table public.meal_entries from anon, authenticated;
revoke insert, update on table public.saved_meal_entries from anon, authenticated;

comment on table public.meal_entries is
  'One food in a meal. source_* is the immutable original nutrition; calc_* is '
  'derived from it by a trigger for the recorded quantity. Ordinary roles may '
  'SELECT their own rows only; writes go through the privileged server client '
  'after session and ownership checks. Unknown nutrients are NULL, never zero.';
comment on table public.saved_meal_entries is
  'Snapshot copies of the entries captured when a meal was saved; same '
  'immutable-source / trigger-derived snapshot model and permissions as '
  'meal_entries.';

-- ---------------------------------------------------------------------------
-- 4. Integrity constraints (verified against existing rows: zero violations).
-- ---------------------------------------------------------------------------
-- The old check only said "if calc_complete is false then at least one value
-- is missing". The engine's rule is the other direction too: complete means
-- ALL five values are present.
alter table public.meal_entries
  drop constraint meal_entries_check2;

alter table public.meal_entries
  add constraint meal_entries_calc_complete_check
    check (
      calc_complete = (
        calc_kcal is not null and calc_protein_g is not null
        and calc_carbs_g is not null and calc_fat_g is not null
        and calc_fiber_g is not null
      )
    ),
  add constraint meal_entries_calc_matches_source_check
    check (
      (calc_kcal is null) = (source_kcal is null)
      and (calc_protein_g is null) = (source_protein_g is null)
      and (calc_carbs_g is null) = (source_carbs_g is null)
      and (calc_fat_g is null) = (source_fat_g is null)
      and (calc_fiber_g is null) = (source_fiber_g is null)
    ),
  add constraint meal_entries_source_nonnegative_check
    check (
      (source_kcal is null or source_kcal >= 0)
      and (source_protein_g is null or source_protein_g >= 0)
      and (source_carbs_g is null or source_carbs_g >= 0)
      and (source_fat_g is null or source_fat_g >= 0)
      and (source_fiber_g is null or source_fiber_g >= 0)
    ),
  add constraint meal_entries_calc_nonnegative_check
    check (
      (calc_kcal is null or calc_kcal >= 0)
      and (calc_protein_g is null or calc_protein_g >= 0)
      and (calc_carbs_g is null or calc_carbs_g >= 0)
      and (calc_fat_g is null or calc_fat_g >= 0)
      and (calc_fiber_g is null or calc_fiber_g >= 0)
    ),
  add constraint meal_entries_source_serving_positive_check
    check (source_serving_quantity is null or source_serving_quantity > 0),
  add constraint meal_entries_calc_grams_positive_check
    check (calc_grams is null or calc_grams > 0),
  add constraint meal_entries_unit_basis_pair_check
    check (
      (quantity_unit = 'g' and source_basis = 'per_100g')
      or (quantity_unit = 'ml' and source_basis = 'per_100ml')
      or (quantity_unit = 'serving' and source_basis = 'per_serving')
    );

alter table public.saved_meal_entries
  add constraint saved_meal_entries_calc_complete_check
    check (
      calc_complete = (
        calc_kcal is not null and calc_protein_g is not null
        and calc_carbs_g is not null and calc_fat_g is not null
        and calc_fiber_g is not null
      )
    ),
  add constraint saved_meal_entries_calc_matches_source_check
    check (
      (calc_kcal is null) = (source_kcal is null)
      and (calc_protein_g is null) = (source_protein_g is null)
      and (calc_carbs_g is null) = (source_carbs_g is null)
      and (calc_fat_g is null) = (source_fat_g is null)
      and (calc_fiber_g is null) = (source_fiber_g is null)
    ),
  add constraint saved_meal_entries_source_nonnegative_check
    check (
      (source_kcal is null or source_kcal >= 0)
      and (source_protein_g is null or source_protein_g >= 0)
      and (source_carbs_g is null or source_carbs_g >= 0)
      and (source_fat_g is null or source_fat_g >= 0)
      and (source_fiber_g is null or source_fiber_g >= 0)
    ),
  add constraint saved_meal_entries_calc_nonnegative_check
    check (
      (calc_kcal is null or calc_kcal >= 0)
      and (calc_protein_g is null or calc_protein_g >= 0)
      and (calc_carbs_g is null or calc_carbs_g >= 0)
      and (calc_fat_g is null or calc_fat_g >= 0)
      and (calc_fiber_g is null or calc_fiber_g >= 0)
    ),
  add constraint saved_meal_entries_source_serving_positive_check
    check (source_serving_quantity is null or source_serving_quantity > 0),
  add constraint saved_meal_entries_calc_grams_positive_check
    check (calc_grams is null or calc_grams > 0),
  add constraint saved_meal_entries_unit_basis_pair_check
    check (
      (quantity_unit = 'g' and source_basis = 'per_100g')
      or (quantity_unit = 'ml' and source_basis = 'per_100ml')
      or (quantity_unit = 'serving' and source_basis = 'per_serving')
    );

comment on constraint meal_entries_unit_basis_pair_check on public.meal_entries is
  'A quantity is only computable in the unit its basis supports: g for per_100g, '
  'ml for per_100ml, servings for per_serving. Grams and millilitres are never '
  'interchanged (no density is invented).';

-- ---------------------------------------------------------------------------
-- 5. Snapshot trigger: derives calc_* and refuses tampering on UPDATE.
-- ---------------------------------------------------------------------------
-- Shared by meal_entries and saved_meal_entries (identical snapshot shape).
-- Runs BEFORE, so the CHECK constraints see the derived values. It derives
-- exactly what src/lib/nutrition/food.ts computes:
--   factor = quantity (per_serving) or quantity / 100 (per-100 bases)
--   calc_x = round(source_x * factor * 1000) / 1000, NULL when source_x is NULL
--   calc_grams = quantity for g/per_100g, otherwise NULL (ml and servings
--                claim no mass)
--   calc_complete = all five calculated values present
create or replace function public.enforce_entry_snapshot()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_factor numeric;
begin
  if not (
    (new.quantity_unit = 'g' and new.source_basis = 'per_100g')
    or (new.quantity_unit = 'ml' and new.source_basis = 'per_100ml')
    or (new.quantity_unit = 'serving' and new.source_basis = 'per_serving')
  ) then
    raise exception 'GainWell entry: quantity unit % is not computable for basis %',
      new.quantity_unit, new.source_basis
      using errcode = '22000';
  end if;

  v_factor := case
    when new.source_basis = 'per_serving' then new.quantity
    else new.quantity / 100
  end;

  new.calc_kcal := case
    when new.source_kcal is null then null
    else round(new.source_kcal * v_factor * 1000) / 1000
  end;
  new.calc_protein_g := case
    when new.source_protein_g is null then null
    else round(new.source_protein_g * v_factor * 1000) / 1000
  end;
  new.calc_carbs_g := case
    when new.source_carbs_g is null then null
    else round(new.source_carbs_g * v_factor * 1000) / 1000
  end;
  new.calc_fat_g := case
    when new.source_fat_g is null then null
    else round(new.source_fat_g * v_factor * 1000) / 1000
  end;
  new.calc_fiber_g := case
    when new.source_fiber_g is null then null
    else round(new.source_fiber_g * v_factor * 1000) / 1000
  end;
  new.calc_grams := case
    when new.quantity_unit = 'g' and new.source_basis = 'per_100g'
      then round(new.quantity * 1000) / 1000
    else null
  end;
  new.calc_complete := new.calc_kcal is not null
    and new.calc_protein_g is not null
    and new.calc_carbs_g is not null
    and new.calc_fat_g is not null
    and new.calc_fiber_g is not null;

  if tg_op = 'UPDATE' then
    -- The original snapshot never changes: history must not depend on a live
    -- OFF record or a custom food's current values.
    if new.source_kcal is distinct from old.source_kcal
       or new.source_protein_g is distinct from old.source_protein_g
       or new.source_carbs_g is distinct from old.source_carbs_g
       or new.source_fat_g is distinct from old.source_fat_g
       or new.source_fiber_g is distinct from old.source_fiber_g
       or new.source_basis is distinct from old.source_basis
       or new.source_serving_quantity is distinct from old.source_serving_quantity
       or new.source_serving_unit is distinct from old.source_serving_unit
       or new.source_attribution is distinct from old.source_attribution
       or new.food_source is distinct from old.food_source
       or new.off_product_code is distinct from old.off_product_code
       or new.custom_food_id is distinct from old.custom_food_id
       or new.food_name_snapshot is distinct from old.food_name_snapshot
       or new.brand_snapshot is distinct from old.brand_snapshot then
      raise exception 'GainWell entry: the source snapshot is immutable'
        using errcode = '22000';
    end if;

    -- Unit conversion is not implemented or validated, so the unit is fixed
    -- at creation; only the quantity may change (calc_* is re-derived above).
    if new.quantity_unit is distinct from old.quantity_unit then
      raise exception 'GainWell entry: quantity_unit is immutable'
        using errcode = '22000';
    end if;

    -- Ownership never moves: an entry cannot be re-filed to another user.
    if new.user_id is distinct from old.user_id then
      raise exception 'GainWell entry: user_id is immutable'
        using errcode = '22000';
    end if;
  end if;

  return new;
end;
$$;

comment on function public.enforce_entry_snapshot() is
  'Derives calc_* from the immutable source snapshot and the recorded '
  'quantity/unit, and refuses UPDATE of source_*, quantity_unit or user_id. '
  'Same rules as src/lib/nutrition/food.ts.';

-- shortcut: parent id (meal_id / saved_meal_id) is not checked on UPDATE, so a
-- privileged write could re-parent an entry within the same user; the app never
-- re-parents. Upgrade if a move feature is ever added.
drop trigger if exists meal_entries_enforce_snapshot on public.meal_entries;
create trigger meal_entries_enforce_snapshot
  before insert or update on public.meal_entries
  for each row
  execute function public.enforce_entry_snapshot();

drop trigger if exists saved_meal_entries_enforce_snapshot on public.saved_meal_entries;
create trigger saved_meal_entries_enforce_snapshot
  before insert or update on public.saved_meal_entries
  for each row
  execute function public.enforce_entry_snapshot();
