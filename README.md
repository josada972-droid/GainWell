# GainWell

A free, bilingual (English/French) nutrition platform for healthy weight gain. Tagline: _A healthier way to grow._

Development is governed by [`AGENTS.md`](AGENTS.md), which defines the product requirements and the staged workflow (Stage 0 foundation → Stage 7 production). Read it before making changes.

## Stack

Next.js App Router · React · TypeScript (strict) · Tailwind CSS v4 · ESLint (flat config) · Prettier.
Later stages add: shadcn/ui, Lucide, Supabase (Postgres + Auth), Zod, React Hook Form, Recharts, next-intl, Vitest, React Testing Library, Playwright. Install them only when their stage arrives.

## Setup

```bash
npm install
cp .env.example .env.local   # fill values when Supabase is set up (Stage 2)
npm run dev
```

## Commands

| Command                | Does                       |
| ---------------------- | -------------------------- |
| `npm run dev`          | Dev server (Turbopack)     |
| `npm run build`        | Production build           |
| `npm run start`        | Serve the built app        |
| `npm run lint`         | ESLint                     |
| `npm run typecheck`    | `tsc --noEmit`             |
| `npm run format`       | Prettier write             |
| `npm run format:check` | Prettier check (no writes) |

## Structure

```
src/app/         App Router routes, layouts (UI only)
src/components/  Reusable UI components
src/lib/         Business logic: nutrition engine, data services, validation — pure, testable, no React
docs/           Architecture and decision documentation
```

Conventions and rules live in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Status

Stage 0 complete: foundation only — no pages, no auth, no nutrition logic. `src/app/page.tsx` is a placeholder; the real frontend arrives in Stage 1.
