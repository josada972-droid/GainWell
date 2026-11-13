# Supabase backend (Stages 2–3)

How the GainWell app talks to Supabase, and exactly what you must configure by
hand. No credentials exist in this repository and none were used while building
this stage — the app is built to run without a project (fail closed: every
request is treated as signed out) and to light up fully once the values below
are set.

## 1. Environment variables

Copy `.env.example` to `.env.local` and fill in:

| Variable                               | Where it is read | Notes                                                                                    |
| -------------------------------------- | ---------------- | ---------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | browser + server | `https://<project-ref>.supabase.co`                                                      |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | browser + server | the new `sb_publishable_…` key (replaces the legacy anon key)                            |
| `SUPABASE_SECRET_KEY`                  | server only      | `sb_secret_…`; not required by Stage 2 code, but keep it out of the browser at all times |

- Validation lives in `src/lib/supabase/env.ts` (Zod). Missing or invalid
  values disable the integration instead of crashing the build.
- `.env*` files are gitignored; only `.env.example` (placeholders) is tracked.
- The secret key is never referenced by browser code and is never sent to the
  client bundle.

## 2. Applying the migration

```bash
# local, first run
npm i -g supabase        # or: npx supabase (as one-off)
npx supabase init        # only if supabase/config.toml does not exist yet
npx supabase start       # local stack: API on 127.0.0.1:54321, Studio on 54323
npx supabase db reset    # applies supabase/migrations/*.sql

# hosted project (from the repo root, once linked)
npx supabase link --project-ref <project-ref>
npx supabase db push
```

`supabase/migrations/0001_profiles.sql` creates:

- `public.profiles` — `id` (uuid, FK to `auth.users(id)` on delete cascade),
  `display_name` (nullable, ≤ 60 chars), `preferred_language` (`en` default,
  constrained to `en`/`fr`), `created_at`, `updated_at`.
- `touch_updated_at` — keeps `updated_at` honest; clients cannot write it.
- `handle_new_user` — a `SECURITY DEFINER` trigger on `auth.users` insert that
  creates the profile row. It has an empty `search_path`, uses fully qualified
  names, and only reads `raw_user_meta_data` keys that the app itself sets
  (`display_name`, `preferred_language`); values are coerced to safe literals.

`supabase/migrations/0002_nutrition_profiles.sql` creates:

- `public.nutrition_profiles` — the onboarding answers, in its own table so
  `public.profiles` stays about account identity and language. `user_id` is the
  primary key and the owner (FK to `auth.users(id)` on delete cascade). Every
  answer column is nullable except `dietary_preference` (`'none'` default), so
  an unfinished onboarding resumes instead of being filled with invented values.
- CHECK constraints mirror the form ranges: `age_years` 0–120, `height_cm`
  90–250, `weight_kg` 25–300, `target_weight_kg` 25–300, `professional_kcal`
  800–8000, `meals_per_day` 1–12, `onboarding_step` 1–5, enums for sex,
  activity, habits, appetite, preference, goal and status. `dietary_notes` is
  capped at 300 characters. **No date of birth is stored** — completed years only.
- `nutrition_profiles_touch_updated_at` — the same `touch_updated_at` trigger as
  `profiles`; clients cannot write the timestamps.

## 3. Row Level Security — decisions

- **Read:** `profiles_select_own` — `for select to authenticated using (auth.uid() = id)`.
- **Update:** `profiles_update_own` — `using (auth.uid() = id) with check (auth.uid() = id)`.
  A row can never be moved onto another user's id.
- **No insert / no delete policy.** The trigger owns inserts; deletes belong to
  a future server-side account-deletion flow, not to API calls.
- **Column grants on top of RLS:** `revoke update … from anon, authenticated`,
  then `grant update (display_name, preferred_language)`. Even a future bug in
  a policy cannot let a user write `id`, `created_at` or `updated_at`.
- Authorization always comes from `auth.uid()` inside Postgres; the app never
  trusts a client-sent user id.
- The server client uses the **publishable** key everywhere. The secret key is
  reserved for future stages (server-only jobs such as account deletion).

`nutrition_profiles` (Stage 3) follows the same model, and `profiles` policies
were not touched:

- **Read / insert / update:** `nutrition_profiles_select_own`,
  `nutrition_profiles_insert_own`, `nutrition_profiles_update_own` — all
  `to authenticated` with `auth.uid() = user_id` (insert uses `with check`).
- **No delete policy**, as with `profiles`.
- **Column grants on top of RLS:** `revoke update … from anon, authenticated`,
  then `grant update` on the fifteen answer columns only — `user_id` and the
  timestamps stay server-managed. `revoke insert, delete … from anon` leaves
  `authenticated` its **table-level INSERT**, because PostgREST needs that
  privilege to write at all; ownership is the RLS policy's job, not the grant's.
- **No upsert.** PostgREST's `ON CONFLICT DO UPDATE` rewrites every column in the
  payload, including the ungranted `user_id`, and fails with 42501. So
  `saveNutritionStep()` inserts on the first save (under the server-verified id)
  and updates afterwards, with a race fallback to the update path. Verified
  against the local database: `pg_attribute.attacl` carries the column UPDATE
  grants and no table-level UPDATE for `authenticated`.

## 4. Manual dashboard configuration (hosted project)

1. **Email templates** (Authentication → Emails): set the confirmation and
   recovery templates to use the PKCE token-hash route:
   ```
   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/en/reset-password
   ```
   (`/auth/confirm` is outside `[locale]`; the route handler picks the locale
   from the `NEXT_LOCALE` cookie.)
2. **Redirect URLs** (Authentication → URL Configuration): add
   `http://localhost:3000/auth/confirm` and your production origin + `/auth/confirm`.
   Set **Site URL** to your production origin.
3. **Rate limits**: default email rate limits apply; raise them if you expect
   real traffic. The app surfaces `over_email_send_rate_limit` politely.

## 5. Session handling

- Cookies carry the session (`@supabase/ssr`), not `localStorage`.
- `src/proxy.ts` calls `auth.getClaims()` once per request and copies rotated
  cookies plus the required no-cache headers onto the outgoing response —
  locale redirects included. It never queries the database.
- Pages verify identity with `auth.getUser()` (server-verified), and the
  dashboard gate runs inside a Suspense boundary (cache-components).
- Without configuration, every call path resolves to "signed out"; no build or
  render path depends on Supabase being present.

## 6. Privacy notes

- Stored per account: email address (by Supabase Auth), optional display name
  (≤ 60 chars), language choice, timestamps. No date of birth, no analytics.
- Stage 3 adds one health-related table, `public.nutrition_profiles`, owned by
  the signed-in user and readable only by that user (RLS): completed age years,
  optional sex, height, current weight, activity level, eating habits, optional
  appetite and meals per day, dietary preference, free-text allergies/avoidance
  (≤ 300 chars), goal, optional target weight, and an optional professional
  calorie target. Estimates are computed from these on render and are **not**
  stored; nothing is invented when an answer is missing. Under-18 accounts store
  the answers they gave but never receive personal numbers.
- **Age is a snapshot, not a birth date.** Time can only make a stored age
  younger than reality, so stale data can never upgrade a minor to an adult
  calculation; a missing age stays unverified. For estimate freshness the
  dashboard asks for a reconfirmation once the row's `updated_at` is over a
  year old — no exact birth date is ever collected (`docs/nutrition.md` §2).
- No nutrition data, tokens or passwords are written to logs. The engine and the
  Server Actions return message keys, never database error text.
- Passwords are Supabase Auth's responsibility (bcrypt); this app never logs
  tokens, passwords or auth errors' payloads.
- Account deletion is **not** implemented in Stage 2. The FK is `on delete
cascade`, so deleting the `auth.users` row removes the profile; a user-facing
  deletion flow is planned for a later stage and will use the server-side
  secret key. Until then, deletion requests are manual (see the privacy page).
- No GDPR-compliance claims are made anywhere in the product; legal review is
  out of scope for this stage.

## 7. Regenerating database types

`src/lib/supabase/types.ts` is a minimal hand-written mirror of the migration.
Once a project exists, replace it with generated types:

```bash
npx supabase gen types typescript --local > src/lib/supabase/types.ts   # local
npx supabase gen types typescript --linked > src/lib/supabase/types.ts  # hosted
```

## 8. What is tested, and what is not

- Unit tests (`npm test`): schemas, redirect whitelist, error mapping, env
  validation — always run.
- RLS isolation (`tests/rls-profiles.test.ts`): runs only with
  `SUPABASE_TEST_URL` + `SUPABASE_TEST_PUBLISHABLE_KEY` against a real project
  (local Supabase works; email confirmation must be off).
- Nutrition RLS (`tests/rls-nutrition-profiles.test.ts`): same gating, plus
  `SUPABASE_TEST_SECRET_KEY` to clean up the test users. It proves own-row
  create/read/update, cross-user read and update denial, refusal to insert for
  another user, refusal to write ungranted columns (`user_id`, timestamps),
  constraint violations, and that the app cannot delete rows.
- E2E flows (`e2e/auth-flows.spec.ts`): only with
  `RUN_SUPABASE_E2E=1 SUPABASE_E2E_URL=… SUPABASE_E2E_PUBLISHABLE_KEY=…`.
- The always-on e2e suite (`e2e/auth.spec.ts`) covers rendering, links, the
  dashboard redirect and overflow with no project configured.
