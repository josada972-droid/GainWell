# GainWell Architecture

Reusable conventions for every stage. `AGENTS.md` remains the source of truth for requirements; this file records how the codebase is organized.

## Directory layout

- `src/app/` — App Router entry points only: routes, layouts, route segments. Thin: they fetch/render, they do not compute. The root layout lives in `src/app/[locale]/layout.tsx`; every public page is under `[locale]`.
- `src/app/tokens.css` / `base.css` / `globals.css` — the design system (see Design system below).
- `src/components/` — Reusable UI components. Presentational; no direct database or API access.
- `src/lib/` — All business logic. Nutrition calculations, Open Food Facts service, Supabase clients, Zod schemas. Pure TypeScript modules with no React imports, so they stay independently testable.
- `src/lib/content/` — Stage 1 hand-written sample recipes and guides (`recipes.ts`, `guides.ts`). Sample content, not production data.
- `src/i18n/` — `routing.ts` (defineRouting), `request.ts` (per-request locale + messages), `navigation.ts` (`createNavigation` links and `usePathname`).
- `src/proxy.ts` — locale detection, redirect, and the `NEXT_LOCALE` cookie.
- `messages/` — `en.json`, `fr.json`; one namespace per page/component.
- `e2e/` — Playwright specs; `playwright.config.ts` drives the built app.
- `docs/` — Architecture, decisions, setup notes; `docs/screenshots/` holds QA evidence.
- `.hallmark/` — the design run's log and captures (its own `.gitignore` keeps the screenshots out).

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

- next-intl v4 with `en` default and `fr`; locale via a `[locale]` root segment, `defineRouting` in `src/i18n/routing.ts`, `src/i18n/request.ts` reading the locale with `next/root-params` (built-in from Next 16.3+), and `src/proxy.ts` using `createMiddleware(routing)` — in v4 the factory is the **default** export of `next-intl/middleware`.
- `next.config.ts` must wrap the config with `createNextIntlPlugin("./src/i18n/request.ts")`; without it the build fails with "Couldn't find next-intl config file".
- Navigation helpers come from `createNavigation(routing)` in `src/i18n/navigation.ts`, so links stay locale-prefixed and slugs stay locale-independent.
- `getLocale()` returns `string`; `src/lib/locale.ts` narrows it to the `Locale` union via `hasLocale`, so pages call `currentLocale()` instead of casting.
- Locale persistence: the proxy sets a `NEXT_LOCALE` session cookie; configurable via `localeCookie`.
- `generateStaticParams()` in the root layout prerenders both locales. Cache Components (`cacheComponents: true`) needs a value for every root parameter.
- Unmatched paths under a valid locale render the localized 404: `[locale]/[...rest]/page.tsx` forwards to `[locale]/not-found.tsx`, and `recipes/not-found.tsx` / `guides/not-found.tsx` carry library-specific copy. `/de` redirects to `/en/de` and 404s. Verify 404 bodies with a browser (Playwright); a raw `fetch` returns the streamed shell.
- Every user-facing string comes from message files (`messages/en.json`, `messages/fr.json`) — no hardcoded UI strings. Counts use ICU plural rules.
- Dates and numbers use `useFormatter()` (Server Components: `getTranslations` + manual formatter); metric units by default.
- Fixed dates only in prerendered pages: the legal pages read an `updatedDate` message key rather than `new Date()`, which fails prerendering under Cache Components.

## Design system

- Hallmark run: genre `modern-minimal`, theme Coral (deal), shape Narrative Workflow, hero Settled, nav three-part bar, footer letter close. The stamp, pre-emit critique and waiver live at the top of `src/app/globals.css`; `.hallmark/log.json` records the build. Re-run the sweep before shipping a visual change: `node <hallmark>/scripts/sloplint.mjs src --genre modern-minimal --scope app --render --url http://localhost:3000/en`.
- `tokens.css` (`@theme static`) holds the brand palette from AGENTS.md §4 as hexes plus the type scale, spacing, radii and shadow tokens; `base.css` is the scaffold floor (focus ring, container, heading measures, reduced motion); `globals.css` holds component classes. Light-only — no dark mode in Stage 1.
- Contrast is fixed once: ink on paper 12.58, ink on cream 11.19, ink on sage 8.79, ink on peach 7.99, muted on paper 5.36, green fill with paper ink 4.62, focus ring on paper 7.17. Re-check after any token change.
- Unlayered CSS in `base.css`/`globals.css` beats Tailwind utilities, so a class like `.stock` or `.well` must not be combined with `bg-*` utilities.
- Tailwind v4 reads theme keys: use `text-sm`, `text-title`, `text-display-s`. The shorthand `text-(--text-lg)` resolves to a **color**, not a font size, and silently leaves the text at body size — never use it for the type scale.
- Recipes and guides render as hairline rows, not repeated cards (AGENTS.md §4 avoid list).

## Dependency policy

- Add a dependency only when the current stage needs it, and say why. No speculative packages.
- Stage 1 shipped: `next-intl` (bilingual UI), `lucide-react` (icons), `cn` + `class-variance-authority` + `@base-ui/react` + `shadcn` (the shadcn/ui base AGENTS.md §3 requires; only `Button` is installed and no page uses it yet — it arrives with Stage 2 forms), `@playwright/test` (QA gate, earlier than the Stage 6 plan because Stage 1 is the first UI).
- `npx shadcn` fails on this machine (`EALLOWSCRIPTS` from the user's `~/.npmrc`); run the CLI as `node node_modules\shadcn\dist\index.js`.
- Stage plan: Stage 2 Supabase · Stage 3 Zod + React Hook Form + Vitest · Stage 4 Open Food Facts service · Stage 5 Recharts · Stage 6 React Testing Library.

## Formatting and linting

- Prettier with pinned defaults (`.prettierrc`): semicolons, double quotes, trailing commas. Run `npm run format:check` before committing.
- ESLint flat config (`eslint.config.mjs`): Next core-web-vitals + TypeScript rules, with `eslint-config-prettier` last so formatting rules never conflict.
- TypeScript `strict` stays on; avoid `any`.

## Mock data

Temporary sample content must be clearly marked (module name, comment, or metadata) and removed at Stage 6. Mock data never silently stands in for production data.

- Stage 1 content is hand-written sample data in `src/lib/content/recipes.ts` and `guides.ts` — no scraped recipe text, no fabricated nutrition from a database. Recipe and guide pages carry a visible sample notice, the recipe list says values are estimates, and the homepage dashboard preview derives its numbers from the seed recipes and is captioned as sample.
- Nothing here talks to Supabase. Pages read the seed modules through the same shape a later repository layer will return, so the swap is a fetch, not a rewrite.

## Testing

- Each stage ships its tests with it: Vitest for `src/lib` logic, React Testing Library for components, Playwright for user journeys. A feature is not done until its relevant tests pass.
- Vitest defaults to `environment: "node"`; component tests need the `jsdom` package. Vitest also collects `*.spec.ts`, which collides with Playwright's test files — the Vitest config must exclude the e2e directory. Tests using next-intl's `createNavigation` need `test.server.deps.inline: ["next-intl"]`.
- Playwright drives the built app via `webServer` (`npm run start`) and responsive viewports through config `projects` (`devices`), with per-test `page.setViewportSize()` for 320/375 px.
- Stage 1 specs (`npm run test:e2e`): every route in both locales, locale redirect and cookie persistence, localized 404s, nav and footer link resolution, recipe search (accent-folded) and category filters, serving scaling, no horizontal overflow at 320/375/768/1024/1440, mobile menu, keyboard focus and landmarks, and a console/page-error guard. Assert navigation with `await expect(page).toHaveURL(...)` — reading `page.url()` right after a click races the client-side redirect.
- The console guard ignores "Failed to load resource" so the intentional 404 tests do not fail on their own status codes.
