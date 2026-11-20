-- Stage 3: nutrition_profiles — the health-related onboarding answers, kept in
-- its own table so `public.profiles` stays about account identity and language.
--
-- Data minimization (AGENTS.md §16): completed age years is stored, never a
-- date of birth — the product needs an eligibility boundary, not a birthday.
-- Sex is optional and only used by the resting-energy equation; it is never
-- inferred from anything else. Allergies/avoidance text is free text the user
-- writes about themselves, capped and nullable.
--
-- Security model, same conventions as 20251117000001_profiles.sql (docs/supabase.md):
-- * `user_id` IS the owner, a FK to auth.users on delete cascade.
-- * RLS restricts select/insert/update to auth.uid() = user_id.
-- * No DELETE policy: account deletion is a future server-side flow.
-- * Column grants let a user write only the onboarding answers; user_id and
--   the timestamps stay server-managed.
-- * The app never sends a user id it trusts; auth.uid() decides ownership.

create table public.nutrition_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,

  -- Step 1: body measures. Nullable because onboarding can be resumed midway.
  age_years smallint check (age_years >= 0 and age_years <= 120),
  sex text check (sex in ('female', 'male')),
  height_cm numeric(5, 1) check (height_cm >= 90 and height_cm <= 250),
  weight_kg numeric(5, 1) check (weight_kg >= 25 and weight_kg <= 300),

  -- Step 2: activity and eating habits.
  activity_level text
    check (activity_level in ('sedentary', 'light', 'moderate', 'high')),
  eating_habits text
    check (eating_habits in ('regular', 'skipped_meals', 'low_appetite', 'varied')),
  appetite_level text check (appetite_level in ('low', 'medium', 'high')),
  meals_per_day smallint check (meals_per_day between 1 and 12),

  -- Step 3: dietary preferences and things to avoid. Preference defaults to
  -- 'none' so "no specific preference" is an explicit answer, not a blank.
  dietary_preference text not null default 'none'
    check (dietary_preference in
      ('none', 'vegetarian', 'vegan', 'pescatarian', 'other')),
  dietary_notes text
    check (dietary_notes is null or char_length(btrim(dietary_notes)) <= 300),

  -- Step 4: goals. `professional_kcal` is a target a qualified professional
  -- gave the user; it is stored separately from GainWell's estimates and is
  -- never overwritten by a recalculation.
  goal text
    check (goal in
      ('gain_gradually', 'eating_consistency', 'healthier_habits', 'professional_guidance')),
  target_weight_kg numeric(5, 1)
    check (target_weight_kg between 25 and 300),
  professional_kcal integer check (professional_kcal between 800 and 8000),

  -- Resume support: the step to continue at, and whether onboarding finished.
  onboarding_status text not null default 'in_progress'
    check (onboarding_status in ('in_progress', 'completed')),
  onboarding_step smallint not null default 1
    check (onboarding_step between 1 and 5),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.nutrition_profiles is
  'Onboarding answers per auth user (body measures, habits, diet, goals). '
  'Owner-only access via RLS; estimates are computed in the app, never stored.';
comment on column public.nutrition_profiles.age_years is
  'Completed years, used for the 18+ eligibility boundary. No date of birth '
  'is stored: the product does not need it.';
comment on column public.nutrition_profiles.sex is
  'Optional input for the Mifflin-St Jeor resting-energy equation. Never '
  'inferred from other answers.';
comment on column public.nutrition_profiles.professional_kcal is
  'A daily energy target supplied by a qualified professional. Kept separate '
  'from GainWell estimates and never overwritten by them.';

-- Same updated_at rule as profiles: the trigger owns the timestamp.
create trigger nutrition_profiles_touch_updated_at
  before update on public.nutrition_profiles
  for each row
  execute function public.touch_updated_at();

alter table public.nutrition_profiles enable row level security;

create policy "nutrition_profiles_select_own" on public.nutrition_profiles
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Inserts are allowed only for the caller's own row; the app inserts on the
-- first save under the server-verified id, so no trigger is needed and a
-- cross-user write is impossible.
create policy "nutrition_profiles_insert_own" on public.nutrition_profiles
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "nutrition_profiles_update_own" on public.nutrition_profiles
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- No DELETE policy: deletion belongs to the future account-deletion flow.

-- Privilege layer (defense in depth on top of RLS), the same pattern as 0001:
-- Supabase's default grants let any role write every column it can reach, so the
-- write surface is narrowed to exactly the onboarding answers. `user_id` and the
-- timestamps stay server-managed. `authenticated` keeps its table-level INSERT
-- privilege (PostgREST needs it to write at all); ownership is the RLS policy's
-- job. `anon` gets no write path at all.
revoke update on table public.nutrition_profiles from anon, authenticated;
grant update (
  age_years,
  sex,
  height_cm,
  weight_kg,
  activity_level,
  eating_habits,
  appetite_level,
  meals_per_day,
  dietary_preference,
  dietary_notes,
  goal,
  target_weight_kg,
  professional_kcal,
  onboarding_status,
  onboarding_step
) on table public.nutrition_profiles to authenticated;

revoke insert, delete on table public.nutrition_profiles from anon;
