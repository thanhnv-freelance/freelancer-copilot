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

* [ ] Set up AI SDK streaming in `lib/ai/`
* [ ] Build proposal generation prompt template
* [ ] Build requirement summarization prompt
* [ ] Add streaming proposal UI (`useCompletion` hook)
* [ ] Add AI risk analysis output

---

## Phase 5 — Application Tracker

* [ ] Create `applications` table schema
* [ ] Build application tracker UI (status board)
* [ ] Add proposal status lifecycle (sent → interview → won/lost)
* [ ] Dashboard metrics: response rate, win rate, revenue

---

## Phase 6 — Analytics

* [ ] Build analytics page with Recharts
* [ ] Weekly KPI summary: proposals sent, response rate, win rate
* [ ] Average hourly rate calculation
* [ ] Revenue tracking over time

---

## Infrastructure

* [x] Add `.env.example`
* [ ] Set up GitHub Actions CI (install → lint → test → build)
* [ ] Configure Vercel Cron for scheduled tasks

---

## Future

* [ ] Reusable assets library (proposal templates, intro messages)
* [ ] AI opportunity ranking via embeddings
* [ ] Client risk detection (hire rate, unclear scope signals)
* [ ] Proposal analytics (length, keywords, success correlation)
* [ ] Multi-platform support (Freelancer, Fiverr, LinkedIn)
