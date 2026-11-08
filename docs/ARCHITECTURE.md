# GainWell Architecture

Reusable conventions for every stage. `AGENTS.md` remains the source of truth for requirements; this file records how the codebase is organized.

## Directory layout

- `src/app/` — App Router entry points only: routes, layouts, route segments. Thin: they fetch/render, they do not compute.
- `src/components/` — Reusable UI components. Presentational; no direct database or API access.
- `src/lib/` — All business logic. Nutrition calculations, Open Food Facts service, Supabase clients, Zod schemas. Pure TypeScript modules with no React imports, so they stay independently testable.
- `docs/` — Architecture, decisions, setup notes.

Import alias: `@/*` → `src/*`.

## Client / server boundary

- Server Components by default. Add `"use client"` only where interactivity requires it (forms, charts, the language switcher).
- Secrets (`SUPABASE_SECRET_KEY`) are read only in server code. Anything prefixed `NEXT_PUBLIC_` is inlined into the browser bundle at build time — treat it as public. Supabase keys: publishable (`sb_publishable_…`, public) / secret (`sb_secret_…`, server-only); legacy anon/service-role naming is superseded.
- Authorization is enforced server-side and by Supabase Row Level Security (enable RLS per table and revoke default grants). Hiding UI is never the security boundary.
- Route-level redirects live in `src/proxy.ts` — Next 16 renamed `middleware.ts` to `proxy.ts` (Node runtime only). The proxy may check the session cookie only; it must never query the database, because it also runs on prefetched routes.
- All input crossing a trust boundary (forms, route params, API responses) is validated with Zod before use.

## Business logic rules

- Nutritional math lives in `src/lib/nutrition/` (Stage 3), never inside components.
- Units are explicit: grams and millilitres are never interchangeable; values are keyed per 100 g, per serving, or per custom quantity.
- Missing data is represented explicitly (`null` + a source note), never silently fabricated.
- Externally sourced food data keeps its attribution (Open Food Facts, custom user entry).
- Open Food Facts constraints (verified against official docs, Nov 2026): v3.6 is current but has no search endpoint — structured search exists only in deprecated `/api/v2/search`, and full-text name search does not exist server-side at all. Reads need no API key but a custom `User-Agent` (`AppName/Version (ContactEmail)`); limits are 15 reads/min and 10 searches/min **per IP**, so all server-side calls from one deployment share one budget. Plan: cache products in Postgres and search there (local FTS) instead of hammering the API. Caching OFF data into Postgres creates a derived database under ODbL; images are CC BY-SA 3.0. Staging `world.openfoodfacts.net` needs HTTP Basic auth `off:off`.

## Internationalization (Stage 1)

- next-intl v4 with `en` default and `fr`; locale via a `[locale]` root segment, `defineRouting` in `src/i18n/routing.ts`, `src/i18n/request.ts` reading the locale with `next/root-params` (built-in from Next 16.3+), and `src/proxy.ts` using `createMiddleware(routing)`.
- Locale persistence: the proxy sets a `NEXT_LOCALE` session cookie; configurable via `localeCookie`.
- Every user-facing string comes from message files (`messages/en.json`, `messages/fr.json`) — no hardcoded UI strings.
- Dates and numbers use `useFormatter()` (Server Components: `getTranslations` + manual formatter); metric units by default.

## Dependency policy

- Add a dependency only when the current stage needs it, and say why. No speculative packages.
- Stage plan: Stage 1 shadcn/ui + Lucide + next-intl · Stage 2 Supabase · Stage 3 Zod + React Hook Form + Vitest · Stage 4 Open Food Facts service · Stage 5 Recharts · Stage 6 Playwright + React Testing Library.

## Formatting and linting

- Prettier with pinned defaults (`.prettierrc`): semicolons, double quotes, trailing commas. Run `npm run format:check` before committing.
- ESLint flat config (`eslint.config.mjs`): Next core-web-vitals + TypeScript rules, with `eslint-config-prettier` last so formatting rules never conflict.
- TypeScript `strict` stays on; avoid `any`.

## Mock data

Temporary sample content must be clearly marked (module name, comment, or metadata) and removed at Stage 6. Mock data never silently stands in for production data.

## Testing

- Each stage ships its tests with it: Vitest for `src/lib` logic, React Testing Library for components, Playwright for user journeys. A feature is not done until its relevant tests pass.
- Vitest defaults to `environment: "node"`; component tests need the `jsdom` package. Vitest also collects `*.spec.ts`, which collides with Playwright's test files — the Vitest config must exclude the e2e directory. Tests using next-intl's `createNavigation` need `test.server.deps.inline: ["next-intl"]`.
- Playwright drives the built app via `webServer` (`npm run start`) and responsive viewports through config `projects` (`devices`), with per-test `page.setViewportSize()` for 320/375 px.
