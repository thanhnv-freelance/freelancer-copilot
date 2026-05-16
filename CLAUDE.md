# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project Overview

Freelancer Copilot is a Next.js fullstack platform to help freelancers analyze job opportunities, score project fit, generate AI-assisted proposals, and track applications. Initial focus is Upwork workflow support.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend + Backend | Next.js 15 (App Router, Turbopack) |
| Styling | TailwindCSS v4 |
| Database | PostgreSQL via Neon (serverless) |
| ORM | Drizzle ORM (`postgres` driver) |
| Auth | NextAuth v5 |
| AI | Vercel AI SDK (`ai`) + `@ai-sdk/anthropic` + `@ai-sdk/openai` |
| Validation | Zod |
| Charts | Recharts |
| Package Manager | pnpm |
| Testing | Vitest (unit) + Playwright (E2E) |
| Hosting | Vercel + Vercel Cron |

## Commands

```bash
pnpm install         # install dependencies
pnpm dev             # run dev server (next dev --turbo)
pnpm build           # production build
pnpm lint            # ESLint
pnpm test            # Vitest unit tests
```

Database (Drizzle — prefix with `dotenv -e .env.local --`):
```bash
pnpm db:generate     # generate migrations
pnpm db:migrate      # apply migrations
pnpm db:push:dev     # push schema directly (dev only)
pnpm db:studio       # Drizzle Studio UI
```

## Architecture

Next.js fullstack with a layered backend inside the same repo:

```
app/                  # Next.js App Router pages
  dashboard/
  jobs/
  analytics/
  settings/
  api/                # API Route handlers
components/           # Reusable UI components
lib/
  ai/                 # OpenAI prompt templates and wrappers
  db/                 # Drizzle client and schema
  scoring/            # Job match scoring engine logic
  parser/             # Job description parsing
  utils/
services/             # Business logic (job, proposal, analytics)
drizzle/              # Migration files
```

### Key API Routes

- `GET /api/jobs` — list imported jobs
- `POST /api/jobs/import` — import jobs
- `POST /api/score` — calculate job match score
- `POST /api/proposal/generate` — generate AI proposal draft
- `GET /api/analytics` — freelancing metrics

### Scoring Engine

Located in `lib/scoring/`. Calculates a numeric match score per job based on weighted factors (skill match, budget, competition, payment verification). Returns a score and reasoning array.

### AI Layer

Located in `lib/ai/`. Uses Vercel AI SDK with the Anthropic provider (Claude) as primary, OpenAI as fallback. All streaming UI uses `useChat`/`useCompletion` hooks — no custom streaming logic. Prompt templates take job description + freelancer profile as input; output proposal draft, selling points, and risk analysis.

## Database Schema (Planned)

Three main tables: `jobs`, `applications`, `scoring_results`. Schema defined with Drizzle ORM in `lib/db/`.

## Environment Variables

```
DATABASE_URL=
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
```

## Coding Standards

- TypeScript strict mode
- ESLint + Prettier enforced
- Feature-based directory structure
- Service layer for backend logic (not inline in API routes)
- Zod for all input validation at API boundaries
- AI streaming via Vercel AI SDK `useChat`/`useCompletion` hooks only — no custom streaming abstractions
- `postgres` package for DB driver (not `pg`)
