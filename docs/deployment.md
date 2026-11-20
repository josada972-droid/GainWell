# GainWell production deployment guide

How to put GainWell online: **Vercel** (Next.js hosting) + a **dedicated Supabase
project** (Postgres + Auth) + this GitHub repository. No credentials are
recorded here and no domain is assumed.

**Current infrastructure state**

| Piece               | Value                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------- |
| Source repository   | `https://github.com/josada972-droid/GainWell` (private, branch `main`)                |
| Production Supabase | dedicated `GainWell Production` project — see §12 for its project ID once provisioned |
| Vercel              | not connected yet (Stage 7D)                                                          |
| Domain              | none chosen yet                                                                       |

> Two rules that keep production safe:
>
> 1. **Never reuse another project's Supabase instance.** GainWell needs its own
>    project; an existing project used by a different website must stay untouched.
> 2. **Never point local development at production.** Local work uses the local
>    Docker stack (`npx supabase start`); production credentials live only in
>    Vercel's environment settings.

Legend for the steps: **[dashboard]** = action in the Supabase or Vercel web UI;
**[local]** = command run in this repository.

---

## 0. Prerequisites

- A Supabase account (new project; free plan is fine to start).
- A Vercel account with access to this GitHub repository.
- Supabase CLI (installed as a dependency-free one-off via `npx supabase`).
- Node.js 20.9+ locally (Next.js 16 minimum; Node 22 LTS recommended).
  On Vercel, set the project's Node.js version explicitly (Settings → General →
  Node.js Version → 22.x) rather than relying on the platform default.

---

## 1. Create the dedicated Supabase project [dashboard]

1. Supabase dashboard → **New project**.
2. Choose an organization, a project name (e.g. `gainwell`), a strong database
   password (store it in a password manager), and the region closest to your
   audience.
3. Wait for provisioning, then note from **Project Settings → API**:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Publishable key** (`sb_publishable_…`) → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - **Secret key** (`sb_secret_…`) → `SUPABASE_SECRET_KEY` (server-only; see §4)
4. Do not enable anything else yet. Do not import data.

The project starts empty. The schema arrives in §2; all content (recipes,
guides) is application code and needs no database seed.

---

## 2. Apply the migrations [local]

Migration files live in `supabase/migrations/` with CLI timestamp names:

| #   | File                                           | Creates                                                                                                                                                                        |
| --- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | `20251117000001_profiles.sql`                  | `profiles`, `touch_updated_at`, `handle_new_user`, RLS, column grants                                                                                                          |
| 2   | `20251117000002_nutrition_profiles.sql`        | `nutrition_profiles`, RLS, trigger, column grants                                                                                                                              |
| 3   | `20251117000003_meal_tracking.sql`             | `custom_foods`, `meals`, `meal_entries`, `saved_meals`, `saved_meal_entries`, `off_products_cache`, `off_search_cache`, `off_rate_limit`, deletion functions, limiter function |
| 4   | `20251117000004_stage4_security_hardening.sql` | limiter replaced (service-role only), cache policies dropped, entry writes revoked, integrity constraints, `enforce_entry_snapshot`                                            |
| 5   | `20251117000005_recipes_progress.sql`          | `recipe_favorites`, `weight_entries`, RLS, column grants                                                                                                                       |
| 6   | `20251117000006_truncate_hardening.sql`        | revokes `TRUNCATE`/`REFERENCES`/`TRIGGER` from `anon`/`authenticated`; rewrites the `postgres` default-privilege entry                                                         |

Apply them in order, exactly once:

```bash
npx supabase login                       # one-off, opens the browser
npx supabase link --project-ref <project-ref>
npx supabase db push                     # applies migrations 1–6 in order
```

`db push` shows the files it applies; if it reports "Remote migration versions
not found", nothing was applied — see Troubleshooting.

### Verify the fresh database [dashboard SQL editor or psql]

Run these checks after the push (all must match):

```sql
-- 12 tables, all RLS-enabled (off_rate_limit is internal state: RLS not needed,
-- it has no grants to client roles at all)
select count(*) from information_schema.tables where table_schema = 'public';
select relname, relrowsecurity from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind = 'r' order by 1;

-- no browser role may truncate anything (migration 6)
select count(*) as truncate_grants
  from information_schema.role_table_grants
  where grantee in ('anon', 'authenticated')
    and privilege_type = 'truncate' and table_schema = 'public';   -- expect 0

-- future tables created by postgres inherit no truncate/references/trigger
select pg_get_userbyid(defaclrole) as granting_role, defaclacl
  from pg_default_acl d join pg_namespace n on n.oid = d.defaclnamespace
  where n.nspname = 'public' and defaclobjtype = 'r';

-- every SECURITY DEFINER function pins an empty search_path
select p.proname, p.prosecdef, p.proconfig
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' and p.prosecdef;
```

Expected: 12 tables; `relrowsecurity = true` on all user-data and cache tables;
0 truncate grants; `anon`/`authenticated` default ACL without `D`/`x`/`t`
(the `supabase_admin` row may still show them — dormant, since only `postgres`
creates tables in `public` here; if it ever matters, re-run the revoke and
check what created the table).

---

## 3. Configure Supabase Auth [dashboard]

Authentication → **URL Configuration**:

| Setting           | Value                                                                                            |
| ----------------- | ------------------------------------------------------------------------------------------------ |
| **Site URL**      | the production origin, e.g. `https://<vercel-project>.vercel.app` (later: your domain)           |
| **Redirect URLs** | `https://<vercel-project>.vercel.app/auth/confirm`                                               |
|                   | `http://localhost:3000/auth/confirm` (local development)                                         |
|                   | preview pattern, only if you will test auth on previews: `https://*-<vercel-team>.vercel.app/**` |

Authentication → **Emails** — set both templates to the PKCE token-hash links
the app's `/auth/confirm` route expects:

```
Confirmation: {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
Recovery:     {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/en/reset-password
```

(The equivalents live in `supabase/templates/*.html` for the local stack; copy
their markup into the dashboard templates to keep the styling identical.)

Authentication → **Providers → Email**: keep **Confirm email** enabled in
production. Local development turns it off (`supabase/config.toml`), which is
why local E2E tests can sign in immediately.

### Email delivery

- The built-in Supabase email service is **rate-limited and not intended for
  production use**. It is enough to smoke-test a handful of signups.
- For real users, configure **custom SMTP** (Authentication → Emails → SMTP
  settings) with a transactional provider (e.g. Resend, SendGrid, Postmark) and
  a verified sender domain. This needs a domain; until one exists, keep the
  built-in service and expect small hourly limits.
- The app already surfaces `over_email_send_rate_limit` politely.

### Session handling notes

No additional configuration is needed: cookies are managed by `@supabase/ssr`,
`src/proxy.ts` refreshes claims per request, and `/auth/confirm` is excluded
from locale rewriting. Protected routes always re-verify with `auth.getUser()`
server-side.

---

## 4. Environment variables

Set these in **Vercel → Project → Settings → Environment Variables**
(Production scope; add Preview/Development scopes deliberately — see §7).
They mirror `.env.local` for local work.

| Name                                   | Scope            | Where it comes from                     | Required in production                              | Local fallback                           |
| -------------------------------------- | ---------------- | --------------------------------------- | --------------------------------------------------- | ---------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | browser + server | Supabase → Settings → API → Project URL | yes                                                 | local stack URL `http://127.0.0.1:54321` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | browser + server | Supabase → API → Publishable key        | yes                                                 | from `npx supabase status`               |
| `SUPABASE_SECRET_KEY`                  | **server only**  | Supabase → API → Secret key             | yes (tracker entry writes, OFF cache, rate limiter) | from `npx supabase status`               |
| `OPENFOODFACTS_CONTACT`                | server only      | your contact email or URL               | optional (polite OFF User-Agent)                    | unset                                    |

Rules already enforced by the code:

- `NEXT_PUBLIC_*` values are inlined into the browser bundle. **Never** put the
  secret key in a `NEXT_PUBLIC_` variable.
- `src/lib/supabase/env.ts` validates the public pair with Zod and fails closed:
  without configuration the site still builds and public pages render, member
  features treat the visitor as signed out.
- The secret key is only read through `src/lib/supabase/admin.ts`, which imports
  `server-only`. Missing secret key = privileged paths fail closed with a
  translated error, never an insecure fallback.
- Vercel env changes only apply to new deployments — redeploy after editing.
- No secret values are recorded in this repository, `.env.example` included.

Note: the app derives its own origin from requests (redirects are
origin-relative, whitelisted in `src/lib/auth/redirect.ts`), so no
`NEXT_PUBLIC_APP_URL`-style variable is needed.

---

## 5. Connect the repository to Vercel [dashboard]

1. Vercel → **Add New → Project** → import this GitHub repository.
2. Framework preset: **Next.js** (auto-detected). Keep the defaults:
   - Install: `npm install`
   - Build: `npm run build`
   - Output: Next.js default (`.next`)
3. Set **Node.js Version** to 22.x (Settings → General).
4. Add the environment variables from §4 (Production scope).
5. Deploy. Vercel serves the initial URL
   `https://<project>.vercel.app` — this is the value for Supabase's Site URL
   and redirect URL in §3 (add it after the first deploy if you did not know
   the URL beforehand; then redeploy only if env values changed).
6. Every later push to `main` redeploys automatically. Previews get their own
   URLs (see §7).

Compatibility notes verified in Stage 7A:

- Next.js 16.4.5 App Router with Cache Components / partial prerendering, Server
  Actions, route handler (`/auth/confirm`) and proxy middleware — all standard
  Vercel-supported features.
- Recharts is used only in a `"use client"` component (`weight-chart.tsx`); no
  Node-only APIs (`fs`, `child_process`, `node:` imports) exist in the app.
- Fonts load through `next/font/google` (build-time fetch, self-hosted output).
- No `next/image` remote patterns are configured and no remote images are used.
- Build needs **no** Supabase values (env is read lazily at request time), so
  the build passes even before §4; the deployed site needs them for member
  features.

---

## 6. Smoke test the production deployment

Do this with a brand-new email address, in a private window:

1. `/` redirects to `/en` (or `/fr` per browser language); switch locales and
   confirm `/fr` copies.
2. Sign up → confirmation email arrives → link lands on `/auth/confirm` →
   signed in on the dashboard.
3. Complete onboarding; the dashboard shows the estimate; reload → still signed
   in (session cookies survive).
4. Tracker: search Open Food Facts (may be slow on first call — cache is cold),
   add a custom food, edit a quantity, delete an entry.
5. Recipes: favourite one, reload, unfavourite.
6. Progress: add a weight entry, edit it, delete it; chart renders.
7. Forgot password → email → set a new password → sign in with it.
8. Log out → protected routes redirect to login (with locale preserved).
9. Check the Vercel runtime logs for errors and the Supabase logs for failed
   auth requests.
10. Confirm no console errors and no content overflow at 375 px width.

---

## 7. Preview deployments and environment separation

- Production (`main`) uses the production Supabase project.
- Previews: either (a) leave Supabase variables unset — previews then render
  public pages only, member features behave as signed out; or (b) configure a
  **second, disposable** Supabase project (or branch database) and set the
  variables only in the Preview scope. Never let previews write to the
  production database with the production secret key.
- Local development stays on the Docker stack. `.env.local` is gitignored and
  must never contain production secrets on a shared machine.
- Never copy the production `SUPABASE_SECRET_KEY` into `.env.local`
  "temporarily".

---

## 8. Custom domain (later, optional)

Only when a domain has been chosen and purchased. **Do not invent one now.**

1. Vercel → Project → Domains → add the domain (Vercel shows the DNS records:
   `A`/`CNAME` or nameservers).
2. Update DNS at the registrar with those records; HTTPS is provisioned
   automatically.
3. Supabase → Authentication → URL Configuration: set **Site URL** to
   `https://<domain>` and add `https://<domain>/auth/confirm` to redirect URLs.
   Keep the Vercel URL entries during the transition.
4. Redeploy (or just verify) and repeat the §6 smoke test on the new domain.
5. Update the privacy/terms pages if they mention a contact address.

---

## 9. Operations: logs, backups, limits

### Monitoring

- **Vercel**: Project → Logs (runtime errors, function durations) and
  Deployments → build logs. Add Vercel's free error notifications if desired.
- **Supabase**: Logs & Analytics (API, Auth, Postgres). Auth errors appear
  under Auth logs; failed API requests under PostgREST logs.
- The app returns translated message keys, never raw database text; if a user
  reports an error, correlate by timestamp rather than expecting the message
  to contain internals.

### Backups and recovery

- Supabase free plan: daily backups on a short retention (check the current
  plan in the dashboard); **no point-in-time recovery**. Paid plans add longer
  retention and PITR.
- Migrations are forward-only. A bad release is rolled back by redeploying the
  previous Vercel deployment; a bad **data** change needs a backup restore.
  Take a manual backup (dashboard → Database → Backups) before any risky manual
  SQL.
- Account deletion does not exist yet; user rows cascade from `auth.users` when
  an account is removed by an administrator.

### Free-tier realities (verify current numbers in the dashboards)

- **Supabase free**: ~500 MB database, limited egress, 50k monthly active users,
  and projects **pause after about a week of inactivity** — a paused project
  takes the site's member features down until resumed. Upgrade if the site must
  stay reliably online.
- **Vercel Hobby**: intended for non-commercial use, with monthly bandwidth and
  function limits; exceeding them throttles/blocks until the next cycle.
  Commercial use requires a paid plan.
- **Open Food Facts**: the app already stays below the official per-IP limits
  (search 6/min, product 10/min, enforced in Postgres, shared across all
  serverless instances). No account or key is required; consider setting
  `OPENFOODFACTS_CONTACT` so OFF can reach you if your traffic misbehaves.

---

## 10. Keeping local and production isolated

| Concern     | Local                                     | Production                     |
| ----------- | ----------------------------------------- | ------------------------------ |
| Database    | Docker stack (`npx supabase start`)       | new dedicated Supabase project |
| Env file    | `.env.local` (from `npx supabase status`) | Vercel env vars                |
| Auth emails | Mailpit (`http://127.0.0.1:54324`)        | Supabase email / custom SMTP   |
| Tests       | gated suites against the local stack      | not run against production     |
| Data        | throwaway fixtures                        | real users only — starts empty |

Do not run `supabase db reset`, E2E suites, or cleanup scripts against the
production project. The gated suites delete the accounts they create; their
URLs come from environment variables precisely so they can never accidentally
target production.

---

## 11. Troubleshooting

- **`db push` says "Remote migration versions not found in local migrations
  directory"**: the CLI could not read `supabase/migrations/`. Run it from the
  repository root (this happened in Stage 7A when the shell started in another
  directory) and confirm the files keep their `20251117…` names.
- **`db push` says a migration is already applied**: do not force; inspect
  `supabase_migrations.schema_migrations` with the dashboard SQL editor. Only
  `npx supabase migration repair` when the recorded history genuinely differs.
- **Auth links land on localhost**: Site URL in Supabase still points to the
  local value. Fix in §3 and resend.
- **Member features show "configuration" errors in production**: the secret key
  is missing or wrong scope in Vercel; redeploy after setting it.
- **Signups fail with a rate-limit message**: built-in email limits — configure
  SMTP (§3).
- **A preview deployment shows member features broken**: expected if Supabase
  variables are intentionally unset for Preview (§7).
