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
- Secrets (`SUPABASE_SERVICE_ROLE_KEY`) are read only in server code. Anything prefixed `NEXT_PUBLIC_` ships in the browser bundle — treat it as public.
- Authorization is enforced server-side and by Supabase Row Level Security. Hiding UI is never the security boundary.
- All input crossing a trust boundary (forms, route params, API responses) is validated with Zod before use.

## Business logic rules

- Nutritional math lives in `src/lib/nutrition/` (Stage 3), never inside components.
- Units are explicit: grams and millilitres are never interchangeable; values are keyed per 100 g, per serving, or per custom quantity.
- Missing data is represented explicitly (`null` + a source note), never silently fabricated.
- Externally sourced food data keeps its attribution (Open Food Facts, custom user entry).

## Internationalization (Stage 1)

- next-intl with `en` default and `fr`; locale in the route (`/[locale]/...`) or middleware.
- Every user-facing string comes from message files (`messages/en.json`, `messages/fr.json`) — no hardcoded UI strings.
- Dates and numbers are localized; metric units by default.

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

Each stage ships its tests with it: Vitest for `src/lib` logic, React Testing Library for components, Playwright for user journeys. A feature is not done until its relevant tests pass.
