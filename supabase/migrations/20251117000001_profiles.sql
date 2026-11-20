-- Stage 2: profiles — one row per authenticated user, owned by that user.
--
-- Security model (docs/supabase.md holds the full rationale):
-- * The row's `id` IS the user id: a FK to auth.users, created by a trigger,
--   never by client input.
-- * RLS restricts SELECT and UPDATE to the row whose id equals auth.uid().
-- * No INSERT/DELETE policy exists: users cannot create or remove profiles
--   (not even their own) through the API; signup is the trigger's job.
-- * Column-level grants let users UPDATE only display_name and
--   preferred_language; id, created_at and updated_at stay server-managed.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) <= 60),
  preferred_language text not null default 'en'
    check (preferred_language in ('en', 'fr')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'One row per auth user. Owned by the user: select/update own only (RLS).';

-- Keep updated_at honest without trusting any client.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row
  execute function public.touch_updated_at();

-- Create the profile when the user is created in auth.users. SECURITY DEFINER
-- is required (the trigger owner must write across schemas), but the function
-- is minimal: empty search_path, fully qualified names, values coerced to safe
-- literals only. It inserts no column that a user could escalate through.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, preferred_language)
  values (
    new.id,
    case
      when char_length(coalesce(new.raw_user_meta_data ->> 'display_name', '')) <= 60
        then nullif(new.raw_user_meta_data ->> 'display_name', '')
      else null
    end,
    case new.raw_user_meta_data ->> 'preferred_language'
      when 'fr' then 'fr'
      else 'en'
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

alter table public.profiles enable row level security;

-- Read: only your own row, and only when signed in.
create policy "profiles_select_own" on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

-- Change: only your own row, with the same check on the way out, so a row
-- can never be moved onto (or off of) another user's id.
create policy "profiles_update_own" on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- No INSERT or DELETE policy: the trigger owns inserts; account deletion is a
-- future stage and will be a server-side flow, not an API delete.

-- Privilege layer (defense in depth on top of RLS): Supabase's default grants
-- let any role update every column of a table it can reach. Narrow that to
-- exactly the two fields the product lets a user change.
revoke update on table public.profiles from anon, authenticated;
grant update (display_name, preferred_language) on table public.profiles to authenticated;

-- Future stages extend this schema (dietary preferences, food items, meals,
-- recipes, weight logs, nutrition goals, favorites). Every new user-owned
-- table must follow the same pattern: FK to auth.users on delete cascade,
-- RLS on with per-action `auth.uid() = <owner column>` policies, and no
-- client-writable id.
