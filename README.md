# GainWell

A free, bilingual (English/French) nutrition platform for healthy weight gain. Tagline: _A healthier way to grow._

Development is governed by [`AGENTS.md`](AGENTS.md), which defines the product requirements and the staged workflow (Stage 0 foundation → Stage 7 production). Read it before making changes.

## Stack

Next.js App Router (16, Cache Components) · React · TypeScript (strict) · Tailwind CSS v4 · next-intl · Lucide · Supabase (Postgres + Auth) · Zod · Recharts · Vitest · React Testing Library · Playwright.

## Setup

```bash
npm install
cp .env.example .env.local   # Supabase URL + keys (see docs/supabase.md)
npx supabase start           # local database for development/testing
npm run dev                  # http://localhost:3000 redirects / to /en
```

No credentials exist in this repository. The public pages work without a configured project; member features (tracking, progress, favourites) need the Supabase variables from `.env.local`.

## Commands

| Command                | Does                                                |
| ---------------------- | --------------------------------------------------- |
| `npm run dev`          | Dev server (Turbopack)                              |
| `npm run build`        | Production build                                    |
| `npm run start`        | Serve the built app                                 |
| `npm run lint`         | ESLint                                              |
| `npm run typecheck`    | `tsc --noEmit` (run after `npm run build`)          |
| `npm run format`       | Prettier write                                      |
| `npm run format:check` | Prettier check (no writes)                          |
| `npm test`             | Vitest unit tests (DB suites auto-skip without env) |
| `npm run test:e2e`     | Playwright against the built app (port 3000)        |

Gated live tests (real local Supabase) and their environment variables are documented in `docs/supabase.md` and the test files themselves.

## Structure

```
src/app/[locale]/   Public pages (home, about, how-it-works, recipes, guides, privacy, terms) plus member pages (dashboard, onboarding, tracker, progress)
src/app/*.css       Design system: tokens.css, base.css, globals.css
src/components/     Reusable UI components (auth, onboarding, tracker, progress, recipes, guides)
src/lib/            Business logic: nutrition engine, Supabase clients, stores/actions, sample content — server-only where it touches the DB
src/i18n/           next-intl routing, request config, navigation helpers
src/proxy.ts        Locale detection, redirect, NEXT_LOCALE cookie, session refresh
messages/           en.json, fr.json — every interface string
supabase/           Migrations (0001–0005), RLS policies, generated types
tests/              Vitest unit + gated live RLS suites
e2e/                Playwright specs
docs/               Architecture and decision documentation
```

Conventions and rules live in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Deployment

Production preparation (dedicated Supabase project, migrations, Auth URLs and
templates, environment variables, Vercel setup, smoke tests, domain and
free-tier notes) lives in [`docs/deployment.md`](docs/deployment.md). Nothing is
deployed yet; no production credentials exist in this repository.

## Status

Stages 0–6 complete: branding and public pages, Supabase auth with RLS,
onboarding and the nutrition engine, meal tracking with Open Food Facts,
recipes with favourites, weight progress, and the Stage 6 integration,
accessibility and polish pass. Stage 7A (production readiness) prepared the
deployment plan and the `0006` privilege-hardening migration; the actual cloud
deployment has not been performed. Content is clearly labelled sample.
