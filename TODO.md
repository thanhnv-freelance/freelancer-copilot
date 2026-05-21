# TODO

## Phase 1 — Foundation

* [x] Initialize Next.js 15 project with pnpm
* [x] Configure TailwindCSS v4
* [x] Set up Drizzle ORM with `postgres` driver (`lib/db/schema.ts`, `lib/db/index.ts`, `drizzle.config.ts`)
* [x] Connect Neon PostgreSQL database (`freelancer_copilot` schema created and tables pushed)
* [x] Configure NextAuth v5 (`auth.ts`, `proxy.ts`, login page)
* [x] Set up Vercel AI SDK with Anthropic provider (`lib/ai/index.ts`)
* [x] Deploy initial skeleton to Vercel

---

## Phase 2 — Job Management

* [x] Create `jobs` table schema (Drizzle)
* [x] Build job dashboard UI (list + filter)
* [x] Implement manual job import (paste from Upwork)
* [x] Add job detail page
* [x] Add filter: budget type, status
* [x] Add bookmark / skip / applied status tracking

---

## Phase 3 — Scoring Engine

* [x] Define scoring rules and weights in `lib/scoring/config.ts`
* [x] Implement `scoreJob` pure function in `lib/scoring/engine.ts`
* [x] Create `scoring_results` table schema (already in Phase 1)
* [x] `services/scoring.service.ts` — save and retrieve scores
* [x] `POST /api/jobs/[id]/score` + `GET /api/jobs/[id]/score`
* [x] Score badge + breakdown UI (`ScorePanel` on job detail page)
* [x] Unit tests for scoring engine (7 passing)

---

## Phase 4 — AI Integration

* [x] Set up AI SDK streaming in `lib/ai/` (Anthropic primary, `toTextStreamResponse`)
* [x] Build proposal generation prompt template (`lib/ai/prompts/proposal.ts`)
* [x] Build job analysis prompt (`lib/ai/prompts/analysis.ts`)
* [x] `POST /api/jobs/[id]/proposal` — streaming proposal route
* [x] `POST /api/jobs/[id]/analyze` — streaming analysis route
* [x] `ProposalPanel` — streaming UI with `useCompletion`, copy to clipboard
* [x] `AnalysisPanel` — streaming UI with section rendering (requirements, red flags, selling points, questions)
* [x] Installed `@ai-sdk/react` for `useCompletion` hook

---

## Phase 5 — Application Tracker

* [x] Create `applications` table schema
* [x] Build application tracker UI (status board)
* [x] Add proposal status lifecycle (sent → interview → won/lost)
* [x] Dashboard metrics: response rate, win rate, revenue

---

## Phase 6 — Analytics

* [x] Build analytics page with Recharts
* [x] Weekly KPI summary: proposals sent, response rate, win rate
* [x] Average hourly rate calculation
* [x] Revenue tracking over time

---

## Infrastructure

* [x] Add `.env.example`
* [x] Set up GitHub Actions CI (install → lint → test → build)
* [x] Configure Vercel Cron for scheduled tasks (`vercel.json` + `GET /api/cron/weekly-digest`)

---

## Gap Fixes (from strategy review, 2026-05-17)

* [x] Multi-platform source field exposed in job import form (Upwork, Contra, LinkedIn, Wellfound, Braintrust, Arc.dev, Other)
* [x] Platform filter on jobs list
* [x] Platform badge on job cards
* [x] Per-platform analytics: sent vs won + win rate breakdown (see BDR-0003, ADR-0004)

---

## Refactor Round 1 (before LinkedIn extension)

### Validation & Schemas
* [x] Extract shared base job Zod schema into `lib/validation/job.schema.ts` — reused by `app/api/jobs/route.ts`, `app/api/extension/import/route.ts`, and `app/(dashboard)/jobs/actions.ts`
* [x] Add Zod validation to `importJobAction` server action (currently does raw `FormData` casts with no validation)
* [x] Replace hardcoded `"upwork"` default strings with `PlatformValue` from `lib/constants/platforms.ts` (e.g. `actions.ts:33`)

### Service Layer
* [x] Rewrite `getJobStats()` in `services/job.service.ts` to use SQL `count()` + `groupBy` — currently loads all rows and filters in memory

### Scoring Engine
* [x] Move hardcoded thresholds from `lib/scoring/engine.ts` into `lib/scoring/config.ts` (e.g. description min length 150, proposal count bands 5/20, spend tiers 1k/10k, rating thresholds 3.5/4.5, hire rate bands 30/70)
* [x] Wire live profile from DB (`profiles` table) into the scoring engine — already wired via `computeAndSaveScore` → `getProfile()` → `toFreelancerProfile()`

### Extension / CORS
* [x] Replace hardcoded `"https://www.upwork.com"` in `app/api/extension/import/route.ts` CORS logic with a derived list from `PLATFORMS` constants — `PLATFORM_WEB_ORIGINS` set in `lib/constants/platforms.ts`

### Schema Prep for Multi-Platform
* [x] Add `platformMeta: jsonb` column to `jobs` table for platform-specific fields (e.g. Upwork `invitesSent`/`hires`/`interviewing`, LinkedIn `easyApply`/`posterTitle`/`connections`) — migration `0005` applied
* [x] Audit which existing Upwork-specific columns (`lastViewedByClient`, `hires`, `interviewing`, `invitesSent`) can be migrated into `platformMeta` — identified; deferred until LinkedIn data accumulates

---

## Phase 7 — LinkedIn Extension

* [ ] Extend CORS allowed origins to include `linkedin.com`
* [ ] Build LinkedIn browser extension (content script scrapes job posting + client info)
* [ ] LinkedIn-specific parse prompt — different fields (poster title, company size, easy apply, applicant count, connection degree)
* [ ] Adapt scoring engine for LinkedIn signals — no payment verification, no proposal count; use applicant count + connection degree + company size instead
* [ ] Platform badge + LinkedIn-specific fields on job detail page
* [ ] E2E test: import a LinkedIn job via extension → score → proposal

---

## Future

* [x] Reusable assets library (proposal templates, intro messages, architecture writeups, checklists)
* [ ] AI opportunity ranking via embeddings
* [x] Client risk detection (clientTotalSpent, vague scope language, unverified+new-client combined flag)
* [x] Auto-score jobs on import (no manual trigger needed)
* [x] Proposal analytics (word count + char count on application cards)
* [ ] Per-platform scoring weight calibration (once data accumulates — see ADR-0004)
* [ ] Inbound lead tracking (LinkedIn DMs, referrals — distinct from job board source)
