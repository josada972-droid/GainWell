-- Stage 5: recipe favourites and weight progress (forward-only).
--
-- What this migration adds, and why:
--
-- 1. `recipe_favorites` — one row per (user, recipe slug). The recipes
--    themselves stay as static bilingual content (src/lib/content/recipes.ts):
--    duplicating a hand-verified, translated catalogue in the database would
--    add nothing but sync problems, so favourites only reference the stable
--    slug. The slug shape is CHECKed here; the app additionally allowlists it
--    against the real recipe list before writing.
-- 2. `weight_entries` — one measurement per user per day (UNIQUE), kilograms
--    with one decimal in the same 25–300 range onboarding uses, an optional
--    short note, and touch_updated_at like every other user table.
--
-- Both tables are fully user-owned: ordinary roles do all four operations
-- through the request-scoped client, with RLS pinning every row to
-- auth.uid() and column grants keeping timestamps and ownership server-side.
-- No privileged client is involved anywhere in Stage 5.
--
-- `anon` keeps nothing on these tables: SELECT is revoked outright (a new
-- table's default Supabase grants would otherwise leave an empty-200 hole),
-- and no anonymous policy exists.

-- ---------------------------------------------------------------------------
-- 1. Recipe favourites
-- ---------------------------------------------------------------------------
create table public.recipe_favorites (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  recipe_slug text not null
    check (
      recipe_slug ~ '^[a-z0-9-]+$'
      and char_length(recipe_slug) between 1 and 80
    ),
  created_at timestamptz not null default now(),
  -- A favourite is unique per user and recipe; the constraint is also the
  -- index the "list my favourites" query uses.
  unique (user_id, recipe_slug)
);

comment on table public.recipe_favorites is
  'A user''s saved recipes, referencing the stable slug of the static '
  'bilingual recipe content (src/lib/content/recipes.ts). The catalogue '
  'itself is not stored in the database; the app allowlists slugs before '
  'writing, so only real recipes can be favourited.';

alter table public.recipe_favorites enable row level security;

create policy "recipe_favorites_select_own" on public.recipe_favorites
  for select to authenticated
  using (auth.uid() = user_id);
create policy "recipe_favorites_insert_own" on public.recipe_favorites
  for insert to authenticated
  with check (auth.uid() = user_id);
create policy "recipe_favorites_delete_own" on public.recipe_favorites
  for delete to authenticated
  using (auth.uid() = user_id);
-- No UPDATE policy on purpose: a favourite points at one fixed recipe.
-- Changing it means remove + re-add, so there is nothing to update.

revoke select, insert, update, delete on table public.recipe_favorites from anon;
revoke insert, update, delete on table public.recipe_favorites
  from authenticated;
grant insert (user_id, recipe_slug) on table public.recipe_favorites
  to authenticated;
grant delete on table public.recipe_favorites to authenticated;

-- ---------------------------------------------------------------------------
-- 2. Weight entries
-- ---------------------------------------------------------------------------
create table public.weight_entries (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  measured_on date not null
    check (measured_on between date '2000-01-01' and current_date),
  -- Kilograms with one decimal, in the same plausible range the onboarding
  -- engine accepts (25–300 kg). No other unit is stored: the app records
  -- kilograms only, so there is nothing to convert or guess.
  weight_kg numeric(5, 1) not null check (weight_kg between 25 and 300),
  note text check (note is null or char_length(btrim(note)) between 1 and 300),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- One measurement per day: a second entry for the same date is refused,
  -- and the constraint is also the index the history query uses.
  unique (user_id, measured_on)
);

comment on table public.weight_entries is
  'A user''s self-recorded weight measurements: at most one per day, in '
  'kilograms (one decimal, 25–300 kg), with an optional note. Progress '
  'views show only these recorded facts — no interpolation, no targets.';

alter table public.weight_entries enable row level security;

create policy "weight_entries_select_own" on public.weight_entries
  for select to authenticated
  using (auth.uid() = user_id);
create policy "weight_entries_insert_own" on public.weight_entries
  for insert to authenticated
  with check (auth.uid() = user_id);
create policy "weight_entries_update_own" on public.weight_entries
  for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "weight_entries_delete_own" on public.weight_entries
  for delete to authenticated
  using (auth.uid() = user_id);

revoke select, insert, update, delete on table public.weight_entries from anon;
revoke insert, update, delete on table public.weight_entries
  from authenticated;
grant insert (user_id, measured_on, weight_kg, note)
  on table public.weight_entries to authenticated;
grant update (measured_on, weight_kg, note)
  on table public.weight_entries to authenticated;
grant delete on table public.weight_entries to authenticated;

-- Keeps updated_at honest, like every other user table (clients cannot
-- write it: the column grants above exclude it).
drop trigger if exists weight_entries_touch_updated_at on public.weight_entries;
create trigger weight_entries_touch_updated_at
  before update on public.weight_entries
  for each row
  execute function public.touch_updated_at();
