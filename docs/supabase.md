# Supabase backend (Stages 2-5)

How the GainWell app talks to Supabase, and exactly what you must configure by
hand. No credentials exist in this repository and none were used while building
this stage — the app is built to run without a project (fail closed: every
request is treated as signed out) and to light up fully once the values below
are set.

## 1. Environment variables

Copy `.env.example` to `.env.local` and fill in:

| Variable                               | Where it is read | Notes                                                                                                                                                       |
| -------------------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | browser + server | `https://<project-ref>.supabase.co`                                                                                                                         |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | browser + server | the new `sb_publishable_…` key (replaces the legacy anon key)                                                                                               |
| `SUPABASE_SECRET_KEY`                  | server only      | `sb_secret_…`; required from Stage 4 (tracker entry writes, the OFF caches and the OFF rate limiter go through the privileged client), never in the browser |

- Validation lives in `src/lib/supabase/env.ts` (Zod). Missing or invalid
  values disable the integration instead of crashing the build.
- `.env*` files are gitignored; only `.env.example` (placeholders) is tracked.
- The secret key is never referenced by browser code and is never sent to the
  client bundle. Never prefix it with `NEXT_PUBLIC_`: variables with that
  prefix are inlined into the browser bundle at build time and must never hold
  privileged credentials.
- The secret is never logged, included in error messages or API responses, or
  exposed to client-side code.

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

On your hosting platform (for example, Vercel project settings), configure
`SUPABASE_SECRET_KEY` as a server-side environment variable **before enabling
tracker functionality**. It is required for tracker entry writes, the OFF
caches and the OFF rate limiter: without it, `getSupabaseAdminClient()`
returns `null`, those privileged operations fail closed, and tracker entry
writes surface the translated `config` error instead of silently falling back
to an insecure client.

`supabase/migrations/20251117000001_profiles.sql` creates:

- `public.profiles` — `id` (uuid, FK to `auth.users(id)` on delete cascade),
  `display_name` (nullable, ≤ 60 chars), `preferred_language` (`en` default,
  constrained to `en`/`fr`), `created_at`, `updated_at`.
- `touch_updated_at` — keeps `updated_at` honest; clients cannot write it.
- `handle_new_user` — a `SECURITY DEFINER` trigger on `auth.users` insert that
  creates the profile row. It has an empty `search_path`, uses fully qualified
  names, and only reads `raw_user_meta_data` keys that the app itself sets
  (`display_name`, `preferred_language`); values are coerced to safe literals.

`supabase/migrations/20251117000002_nutrition_profiles.sql` creates:

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

`supabase/migrations/20251117000003_meal_tracking.sql` and
`supabase/migrations/20251117000004_stage4_security_hardening.sql` build the Stage 4 schema
(§9). 0004 is **forward-only**: 0003 stays as applied and 0004 changes grants,
policies, constraints and functions on top of it, so an existing database is
hardened without rewriting any row.

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
- The server client uses the **publishable** key for all ordinary user reads and
  writes. The secret key lives only on `getSupabaseAdminClient()`
  (`src/lib/supabase/admin.ts`), used for the two narrow jobs ordinary roles are
  barred from (§9.3).

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
  validation, the nutrition engine and the Open Food Facts client — always run.
- RLS isolation (`tests/rls-profiles.test.ts`): runs only with
  `SUPABASE_TEST_URL` + `SUPABASE_TEST_PUBLISHABLE_KEY` against a real project
  (local Supabase works; email confirmation must be off).
- Nutrition RLS (`tests/rls-nutrition-profiles.test.ts`): same gating, plus
  `SUPABASE_TEST_SECRET_KEY` to clean up the test users. It proves own-row
  create/read/update, cross-user read and update denial, refusal to insert for
  another user, refusal to write ungranted columns (`user_id`, timestamps),
  constraint violations, and that the app cannot delete rows.
- Meal-tracking RLS (`tests/rls-meal-tracking.test.ts`): same gating; the
  legitimate entry writes go through the service-role client (the same one the
  server modules use), so those cases additionally need
  `SUPABASE_TEST_SECRET_KEY` and are skipped without it. Proves own-row
  create/read, cross-user read denial, that **no ordinary role can INSERT or
  UPDATE an entry at all** (even a correctly owner-scoped insert), forged
  attachment to another user's meal or saved meal (composite foreign keys),
  that the database re-derives `calc_*` on a quantity edit, that the deletion
  functions refuse another user's rows, that the shared OFF caches reject client
  reads and writes, and that `custom_foods` has no client DELETE path.
- Security hardening (`tests/security-hardening.test.ts`): same gating, with the
  privileged-path groups gated on `SUPABASE_TEST_SECRET_KEY`. Attacks the
  database boundary directly with real authenticated sessions and ordinary REST
  calls: limiter execution denied for `authenticated` and `anon`, forged
  limit/window arguments rejected, unknown buckets refused without creating a
  row, real limit accounting (search 6/min, product 10/min, counters stop at the
  limit), cache reads/enumeration denied, fabricated `calc_*` inserts and
  snapshot/unit/owner UPDATEs refused, hand-written `calc_*` overwritten by the
  trigger, unknown nutrients kept `NULL`, bad unit↔basis pairs and negative
  quantities rejected, and meal totals following the recalculated values.
- Rate-limiter caller (`tests/off-rate-limit.test.ts`): mocked privileged client
  (no live network, no live database). Proves the fail-closed contract — only an
  exact `true` admits a request; `false`, `NULL`, an RPC error, a throw and a
  missing privileged client all deny it — and that the RPC is asked for a bucket
  only, with no caller-supplied limit or window.
- E2E flows (`e2e/auth-flows.spec.ts`, `e2e/onboarding-flows.spec.ts`,
  `e2e/tracker-flows.spec.ts`): only with
  `RUN_SUPABASE_E2E=1 SUPABASE_E2E_URL=… SUPABASE_E2E_PUBLISHABLE_KEY=…`.
  The tracker flow suite makes **no live Open Food Facts calls**; OFF empty
  and error states are covered by mocked unit tests instead.
- The always-on e2e suites (`e2e/auth.spec.ts`, `e2e/tracker.spec.ts`) cover
  rendering, links, the dashboard redirect and overflow with no project
  configured.

## 9. Meal tracking (Stage 4)

### 9.1 Schema

Migration `20251117000003_meal_tracking.sql` adds five user-owned tables and one
service-owned table; `20251117000004_stage4_security_hardening.sql` hardens their
permissions and integrity without changing the shape:

| Table                | Purpose                                                                                                                 |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `meals`              | One container per user/day/type (`breakfast`, `lunch`, `dinner`, `snack`), unique on `(user_id, meal_date, meal_type)`. |
| `meal_entries`       | Rows inside a meal, each a self-contained nutrition snapshot.                                                           |
| `saved_meals`        | A user's reusable meal templates.                                                                                       |
| `saved_meal_entries` | Template contents, same snapshot shape as `meal_entries`.                                                               |
| `custom_foods`       | Foods the user defined themselves (name, brand, per-basis values).                                                      |
| `off_rate_limit`     | Shared rate-limit window counters. No grants to client roles; `bucket` is CHECKed to `search`/`product`.                |

Two shared caches, also service-owned, round out the OFF integration:

| Table                | Purpose                                                                               |
| -------------------- | ------------------------------------------------------------------------------------- |
| `off_products_cache` | One row per barcode, 48 h TTL. No ordinary-role read or write.                        |
| `off_search_cache`   | One row per normalized query (sha-256 key), 48 h TTL. No ordinary-role read or write. |

### 9.2 The snapshot model

Every entry (meal or saved-meal) carries two groups of columns:

- `source_*` — the food's nutrition values as originally recorded, per its
  `source_basis` (`per_100g`, `per_100ml`, `per_serving`), plus
  `source_serving_quantity`/`source_serving_unit`,
  `source_attribution` (the Open Food Facts product URL, when applicable),
  and name/brand snapshots (`food_name_snapshot`, `brand_snapshot`) so history
  stays readable even if the source product or custom food changes later.
- `calc_*` — the values for the entry's current `quantity`/`quantity_unit`.
  These are **derived by the database**, never supplied: the
  `enforce_entry_snapshot` trigger recomputes them from the row's own
  `source_*`, `quantity` and `quantity_unit` on every INSERT and UPDATE, so
  hand-written nutrition numbers cannot be stored even by a privileged write.
  The trigger mirrors `nutritionForQuantity` in `src/lib/nutrition/food.ts`:
  `factor = quantity` for `per_serving`, `quantity / 100` for the per-100
  bases; `calc_x = round(source_x * factor * 1000) / 1000`, `NULL` when
  `source_x` is `NULL`; `calc_grams` only for gram-based entries (millilitres
  and servings never claim a gram mass — no density is invented);
  `calc_complete` is exactly "all five calculated values are present".

Unknown nutrients are stored as `NULL` and are never coerced to zero. Totals
therefore report a lower bound ("At least …"), which the UI states explicitly.

The integrity rules are also CHECK constraints (`calc_complete` equality,
`calc_*`/`source_*` null-parity, nonnegative nutrients, positive
`source_serving_quantity` and `calc_grams`, and the unit↔basis pair), so the
database refuses a row the engine could not compute. `quantity_unit` is
immutable — switching a unit would be an unvalidated conversion — so a quantity
edit changes `quantity` alone and the trigger re-derives everything else.

Immutability is enforced three ways: ordinary roles have no INSERT/UPDATE on the
entry tables at all (§9.3), the trigger raises on any UPDATE of `source_*`, the
provenance/name/brand columns, `quantity_unit` or `user_id`, and the
application only ever sends `quantity` when editing an entry.

### 9.3 Row Level Security and grants

After the hardening pass, the permission model is:

- **Ordinary roles (`anon`, `authenticated`) may only read.** SELECT stays
  owner-scoped on every user-owned table (`using (auth.uid() = user_id)`);
  `anon` has no policy, so it reads nothing.
- **Writes that belong to a user's session stay direct**, on the containers the
  user legitimately authors, all owner-scoped (`WITH CHECK` on insert):
  `meals` SELECT + INSERT, `saved_meals` SELECT + INSERT + UPDATE,
  `custom_foods` SELECT + INSERT + UPDATE. `meals` has no UPDATE policy — a meal
  container is never renamed or moved.
- **Entry writes are server-only.** INSERT and UPDATE are revoked from
  `anon`/`authenticated` on `meal_entries` and `saved_meal_entries`, and the
  `*_insert_own`/`*_update_own` policies are dropped. A signed-in user hitting
  the REST API cannot forge a source snapshot or hand-edit calculated nutrition.
  The application writes those rows through `getSupabaseAdminClient()`
  (`src/lib/supabase/admin.ts`), and every such write first verifies the session
  (`getCurrentUser`), reads the affected rows with the request-scoped client
  under RLS to confirm ownership, and validates the input with the Zod schemas in
  `src/lib/tracker/schema.ts`. The `user_id` written is always the session id,
  never a client-supplied value; composite FKs `(meal_id, user_id)` /
  `(saved_meal_id, user_id)` still reject a mismatched owner even for a
  privileged write.
- **No client role has DELETE on any user-owned table.** Removal goes through
  SECURITY DEFINER functions — `delete_meal_entry`, `delete_saved_meal_entry`,
  `delete_saved_meal` — each of which re-derives the caller from
  `auth.uid()` inside the function and deletes by `(id, user_id)`, returning the
  number of rows removed (0 when the row is not the caller's). These stay
  executable by `authenticated`: they cannot write nutrition, only remove the
  caller's own rows.
- **The rate limiter is service-role only.** `off_rate_limit_take(p_bucket)`
  revokes EXECUTE from `public`, `anon` and `authenticated`; only
  `service_role` (the privileged server client) can spend a token, and the
  bucket CHECK means no caller can invent a bucket.
- **The OFF caches have no ordinary-role path at all.** SELECT/INSERT/UPDATE
  grants for `anon`/`authenticated` are revoked and the `USING (true)` policies
  are dropped, so cached products and cached normalized search queries are
  unreadable through the API. A search query is personal-interest data, so this
  is a privacy boundary, not just an implementation detail.
- `custom_food_id` on entries is a provenance pointer to
  `public.custom_foods(id)` **without a foreign key**, on purpose: historical
  entries must survive the source record becoming unavailable (`SET NULL`
  would contradict the `food_source` CHECK, `CASCADE` would destroy history).
  The engine never reads it back; the snapshots carry everything.

### 9.4 Open Food Facts integration

Two endpoints are used, both verified against the live services:

- Product by barcode (v3 API):
  `GET https://world.openfoodfacts.org/api/v3/product/<barcode>.json?fields=…`
  — success shape `{ status: "success", result: { id: "product_found" }, product: { … } }`,
  with `nutriments` carrying `<key>_100g` / `<key>_serving` values and
  `nutrition_data_per` naming the basis.
- Search (Search-a-licious):
  `GET https://search.openfoodfacts.org/search?q=…&page_size=8&page=1&fields=…&langs=en,fr`
  — shape `{ hits, count, page, page_size, page_count }`; a top-level
  `errors` array means the query itself was malformed.

The client (`src/lib/food/openfoodfacts.ts`) sends a descriptive
`User-Agent` (`GainWell/0.1.0`, plus `OPENFOODFACTS_CONTACT` when configured)
and normalizes products into the app's `Food` shape. When kcal is absent but
kilojoules are present, kcal is derived (`kJ ÷ 4.184`) and flagged
`estimated: true`; missing nutrients stay `null`. Products without a name or
barcode are dropped; per-serving values are kept in their own basis, never
converted to mass.

**Rate limiting** (`src/lib/food/off-rate-limit.ts` + the `off_rate_limit`
table): a fixed-window limiter shared across server instances via Postgres. The
function is `off_rate_limit_take(p_bucket)` — **bucket only**. The limits and the
window live inside the function (migration `20251117000004_stage4_security_hardening.sql`),
not in the caller:
`search` 6/min, `product` 10/min, a 60 s fixed window. The official per-IP maxima
are 10 search / 15 product requests per minute, so GainWell stays under them with
headroom for traffic sharing the same IP. One `INSERT … ON CONFLICT DO UPDATE …
RETURNING` statement per take makes the spend atomic across instances; once a
window is spent the `WHERE used < limit` clause updates nothing, so the counter
stops at the limit instead of growing. Old windows are deleted by the function
itself, so the table stays bounded.

EXECUTE is granted to `service_role` alone — an `authenticated` session or an
anonymous client cannot spend (or raise) the budget. The module fails closed:
`true` is the only answer that permits an outbound request; `false`, `NULL`, an
RPC error, a throw, or a missing privileged client all deny it, and the user sees
a polite "try again soon".

**Caching** (`src/lib/food/off-cache.ts`): product and search responses are
cached 48 h in the two cache tables, keyed by barcode / sha-256 of the normalized
query. Reads, writes and expired-row cleanup all go through
`getSupabaseAdminClient()`; no ordinary role has any access path (§9.3), so the
cache is backend state rather than a user-facing API. Without the secret key the
cache read falls through to a live fetch and cache writes are skipped. Only
normalized `Food` data is stored — never a raw OFF response — and each product row
keeps its attribution URL.

### 9.5 Licensing (Open Food Facts)

- The database content is licensed **ODbL 1.0** (share-alike for derivative
  databases). GainWell stores individual product records server-side, inside
  its own backend, for the user's own later display; that is a private cache
  within one application, not a redistribution of a derivative database, so
  no share-alike obligation is triggered by the caching itself.
- **Attribution**: entries sourced from Open Food Facts store and display the
  per-product URL (`source_attribution`, shown as "View on Open Food
  Facts ↗"). This is the attribution the license asks for.
- Product **images** (CC BY-SA) are not used anywhere in Stage 4.
- Note honestly: attribution alone is _not_ claimed as full legal compliance
  review; if GainWell ever exports or republishes cached product data as a
  database (bulk API, downloads), ODbL share-alike obligations would apply
  and legal review would be required.

## 10. Recipes and progress (Stage 5)

### 10.1 Migration 0005 (`20251117000005_recipes_progress.sql`)

Forward-only, adds two fully user-owned tables. Nothing existing changes.

- `recipe_favorites` — `(id, user_id, recipe_slug, created_at)`.
  - `user_id → auth.users` on delete cascade; `recipe_slug` CHECKed for
    shape (`^[a-z0-9-]+$`, ≤ 80 chars); `UNIQUE (user_id, recipe_slug)`,
    which doubles as the index the "list my favourites" query uses.
  - The recipes themselves are **not** stored in the database: the
    catalogue is static bilingual content (`src/lib/content/recipes.ts`,
    hand-written, marked as estimates). Favourites reference the stable
    slug only, so there is no second copy of the catalogue to keep in sync.
    The app additionally allowlists slugs against the real recipe list
    before writing — the DB checks the shape, the app checks the catalogue.
- `weight_entries` — `(id, user_id, measured_on, weight_kg, note,
created_at, updated_at)`.
  - Kilograms only, `numeric(5,1)`, CHECK 25–300 (the same plausible range
    the onboarding engine accepts). `measured_on` CHECKed against
    `current_date` (no future entries). `note` optional, ≤ 300 chars.
  - `UNIQUE (user_id, measured_on)` — one measurement per day; the app
    never upserts (a duplicate is a friendly error, not a silent overwrite).
  - `touch_updated_at` trigger, like every other user table.

### 10.2 Row Level Security and grants

Every policy pins rows to `auth.uid()`; no policy grants anything to
`anon` (SELECT is revoked outright on both tables — a new table's default
grants would otherwise leave an empty-200 hole, the Stage 4 lesson).

| Table              | SELECT   | INSERT                  | UPDATE                            | DELETE   |
| ------------------ | -------- | ----------------------- | --------------------------------- | -------- |
| `recipe_favorites` | own rows | own rows (`with check`) | **no policy**                     | own rows |
| `weight_entries`   | own rows | own rows (`with check`) | own rows (`using` + `with check`) | own rows |

- `recipe_favorites` has **no UPDATE policy on purpose**: a favourite
  points at one fixed recipe; changing it means remove + re-add.
- Column grants follow Stage 4's pattern: `authenticated` may insert
  `(user_id, measured_on, weight_kg, note)` and update
  `(measured_on, weight_kg, note)` on `weight_entries` — `user_id`,
  `created_at` and `updated_at` are never client-writable, so ownership is
  immutable (the Postgres-level `42501` is covered by a live test).
- **No privileged client anywhere in Stage 5.** All writes (favourites,
  weight entries) go through the request-scoped client with RLS. The admin
  client is only used by the test suites for cleanup.

### 10.3 Application behavior

- Favourites: the Server Action validates the slug against
  `recipeSlugs`, derives the user from the session, and treats a duplicate
  (23505) as success — the favourite exists either way. Anonymous visitors
  browse everything but their "save" button is a link to login with the
  current page as the return path.
- Weight entries: Zod schemas mirror the DB CHECKs (25–300 kg, one
  decimal, real date, ≤ 300-char note) and add the future-date rule with a
  specific error key. Server Actions always take the user from
  `getCurrentUser()`; error responses are message keys
  (`progress.errors.*`), never database text.
- Views show only recorded measurements — no interpolation, no targets,
  no goal inference from onboarding (the progress page says this in plain
  words).

### 10.4 Known limitations (verified in Stage 6; TRUNCATE closed in Stage 7A)

- **Project-wide default `TRUNCATE` grant — resolved by migration
  `20251117000006_truncate_hardening.sql`.** Supabase's project-default
  privileges grant `TRUNCATE` (and inert `REFERENCES`/`TRIGGER`) on every
  `public` table to `anon` and `authenticated` — including all GainWell
  tables. This is pre-existing platform behavior, not something a migration
  added. RLS does not apply to `TRUNCATE` (it is table-level), but it is
  **not reachable**: PostgREST exposes no TRUNCATE verb, and no
  rpc-accessible function truncates anything (verified against the live
  local DB in Stage 6). Stage 7A investigated the origin — two
  `ALTER DEFAULT PRIVILEGES` entries set at project initialization (one for
  tables created by `postgres`, one for `supabase_admin`) — and added
  migration `0006`, which revokes `TRUNCATE, REFERENCES, TRIGGER` on all
  `public` tables from `anon`/`authenticated` and rewrites the `postgres`
  default-privilege entry so future tables do not regain the privilege.
  `service_role` and migration-owner operations are untouched; applied and
  verified on the local database (browser roles can no longer TRUNCATE; a
  newly created table inherits no `TRUNCATE`/`REFERENCES`/`TRIGGER` grants;
  the RLS and security suites all still pass). One residual: `postgres`
  cannot rewrite `supabase_admin`'s default privileges (permission denied,
  verified locally), so tables created _by supabase_admin in `public`_ would
  still inherit the grant. GainWell never creates tables that way —
  `supabase db push` and Studio's table editor both run as `postgres` — so
  this is dormant; the deployment guide's post-deploy verification query
  checks both entries and says what to do if that ever changes.
- **Favourites trust the app-level catalogue.** Direct REST clients can
  insert a well-shaped but nonexistent slug (DB checks shape, the app
  checks the catalogue — §10.1). Accepted in the Stage 5 audit: impact is
  self-scoped (an inflated dashboard count), with no broken UI and no
  cross-user reach. A catalogue table + FK would close it but duplicates
  static translated content in the database; not justified today.
