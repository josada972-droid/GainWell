# GainWell

A free, bilingual (English/French) nutrition platform for healthy weight gain. Tagline: _A healthier way to grow._

Development is governed by [`AGENTS.md`](AGENTS.md), which defines the product requirements and the staged workflow (Stage 0 foundation → Stage 7 production). Read it before making changes.

## Stack

Next.js App Router (16, Cache Components) · React · TypeScript (strict) · Tailwind CSS v4 · next-intl · Lucide · shadcn/ui base · ESLint (flat config) · Prettier · Playwright.
Later stages add: Supabase (Postgres + Auth), Zod, React Hook Form, Recharts, Vitest, React Testing Library. Install them only when their stage arrives.

## Setup

```bash
npm install
cp .env.example .env.local   # fill values when Supabase is set up (Stage 2)
npm run dev                  # http://localhost:3000 redirects / to /en
```

No credentials are needed today: the public frontend reads hand-written sample content from `src/lib/content/`.

## Commands

| Command                | Does                                         |
| ---------------------- | -------------------------------------------- |
| `npm run dev`          | Dev server (Turbopack)                       |
| `npm run build`        | Production build                             |
| `npm run start`        | Serve the built app                          |
| `npm run lint`         | ESLint                                       |
| `npm run typecheck`    | `tsc --noEmit` (run after `npm run build`)   |
| `npm run format`       | Prettier write                               |
| `npm run format:check` | Prettier check (no writes)                   |
| `npm run test:e2e`     | Playwright against the built app (port 3000) |

## Structure

```
src/app/[locale]/  Public pages (home, about, how-it-works, recipes, guides, privacy, terms)
src/app/*.css      Design system: tokens.css, base.css, globals.css
src/components/    Reusable UI components
src/lib/           Business logic: nutrition helpers, sample content — pure, testable, no React
src/i18n/          next-intl routing, request config, navigation helpers
src/proxy.ts       Locale detection, redirect, NEXT_LOCALE cookie
messages/          en.json, fr.json — every interface string
e2e/               Playwright specs
docs/              Architecture and decision documentation
```

Conventions and rules live in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Status

Stage 1 complete: branding, design system, public pages, English and French, responsive layouts, Playwright QA. Content is clearly labelled sample; accounts, tracking and Supabase are Stage 2+.
