# v1 Release Verification Checklist

**Target:** Production-ready, self-hosted personal tool
**Date:** 2026-05-17
**Status:** Pre-release

---

## 0. Pre-flight

- [ ] All feature branches merged to `main`
- [ ] `pnpm build` passes locally with zero type errors
- [ ] `pnpm lint` passes with zero errors
- [ ] `pnpm test` — 15/15 unit tests passing
- [ ] `.env.example` documents every required variable
- [ ] No real secrets committed to git (`DATABASE_URL`, `ANTHROPIC_API_KEY`, etc.)

---

## 1. Database

- [ ] `pnpm db:push:dev` applied against Neon — all 6 tables present:
  - `jobs`
  - `applications`
  - `assets`
  - `scoring_results`
  - `leads`
  - `profiles`
- [ ] `pnpm db:studio` — open Drizzle Studio and confirm schema matches `lib/db/schema.ts`
- [ ] No leftover migration conflicts

---

## 2. Authentication

- [ ] `/login` page loads
- [ ] Valid credentials → redirect to `/dashboard`
- [ ] Invalid credentials → error message shown, no crash
- [ ] Unauthenticated access to `/jobs` → redirect to `/login`
- [ ] Sign out → redirect to `/login`, session cleared

---

## 3. Profile (Settings)

- [ ] `/settings` page loads with default values pre-filled
- [ ] Update name, bio, skills, min fixed budget, min hourly rate → save → "Saved" confirmation
- [ ] Reload page → saved values persist
- [ ] Empty skills field → save → no crash

---

## 4. Job Management

- [ ] `/jobs` — empty state shows onboarding prompt with link to profile and Import
- [ ] `/jobs/new` — form loads with all fields (platform selector, budget type, skills, client info)
- [ ] Import a fixed-budget job → redirects to detail page with score auto-populated
- [ ] Import an hourly job → same
- [ ] Job detail page shows: title, budget, skills, description, score panel, analysis panel, proposal panel, application panel, client info
- [ ] "View on [Platform]" link shows correct platform name (not hardcoded "Upwork")
- [ ] Job status actions work: bookmark, skip, applied
- [ ] `/jobs` list: cards show score badge in correct colour (green ≥75, amber ≥50, red <50)
- [ ] Jobs sorted highest score first; unscored jobs at the bottom
- [ ] Platform filter pills work (All Platforms, Upwork, Contra, etc.)
- [ ] Status filter pills work
- [ ] Budget type filter pills work
- [ ] "Re-score All" button re-scores all jobs using current profile and refreshes list

---

## 5. Scoring Engine

- [ ] Auto-score fires on import — score visible immediately on job detail
- [ ] "Re-score" button on `ScorePanel` updates the score
- [ ] Score breakdown (reasoning items) renders correctly
- [ ] Risk flags render in red callout when present
- [ ] After updating profile skills → "Re-score All" → scores reflect new skills
- [ ] Unit tests: `pnpm test` — 15/15 pass

---

## 6. AI Features

- [ ] "Run Analysis" on job detail → streams sections: Key Requirements, Red Flags, Selling Points, Clarifying Questions
- [ ] "Generate Proposal" → streams proposal text
- [ ] Generated proposal reflects profile bio (verify by checking name/expertise in output)
- [ ] "Copy to clipboard" works
- [ ] "Save to application" creates a draft application with proposal text
- [ ] "Update in application" on regeneration patches existing application
- [ ] Regenerate proposal → new text replaces old, save works again
- [ ] Error state shown if API key is missing or call fails

---

## 7. Application Tracker

- [ ] `/applications` — empty state links to `/jobs`
- [ ] After saving proposal: draft application appears in list
- [ ] Status badge shows correct colour
- [ ] Transition buttons: draft → submitted → interviewing → won/lost
- [ ] "Edit" link → `/applications/[id]` — edit form loads with current values
- [ ] Update status, proposal text, project value, hourly rate, feedback → save → persists
- [ ] Word count and char count shown on list when proposal text exists
- [ ] Delete application → removed from list

---

## 8. Analytics

- [ ] `/analytics` loads without errors
- [ ] KPI row: Proposals Sent, Response Rate, Win Rate, Total Revenue
- [ ] Activity chart (weekly bar chart) renders
- [ ] Revenue chart (area chart) renders
- [ ] Platform breakdown section renders (sent vs won per platform)
- [ ] Funnel chart renders
- [ ] Weekly summary table renders
- [ ] Numbers match expected values based on test data

---

## 9. Assets Library

- [ ] `/assets` page loads
- [ ] Create a new asset (proposal category) → appears in list
- [ ] Edit an asset → updated content persists
- [ ] Copy asset body to clipboard
- [ ] Delete asset → removed from list
- [ ] Category filter tabs work

---

## 10. Leads

- [ ] `/leads` page loads with empty state
- [ ] "Add Lead" form opens inline
- [ ] Create a lead (LinkedIn DM) → appears in list with correct source label
- [ ] Status transitions: new → contacted → meeting → won/lost
- [ ] Delete lead → removed from list
- [ ] Status filter tabs work

---

## 11. Navigation

- [ ] All sidebar links active-highlight correctly
- [ ] Mobile: sidebar visible and usable on narrow viewports
- [ ] Dark/light theme toggle works
- [ ] Sign out button in sidebar footer works

---

## 12. Infrastructure

- [ ] GitHub Actions CI green on `main` (lint + test + build)
- [ ] `vercel.json` cron configured: `0 8 * * 1` → `/api/cron/weekly-digest`
- [ ] `CRON_SECRET` set in Vercel environment variables
- [ ] Weekly digest route returns 401 without correct secret
- [ ] Weekly digest route returns `{ ok: true, kpis: {...} }` with correct secret
- [ ] If `DISCORD_WEBHOOK_URL` set: confirm Discord message received
- [ ] Vercel deployment completes without build errors
- [ ] All environment variables set in Vercel dashboard (match `.env.example`)

---

## 13. E2E Tests (optional, requires dev server)

Run `pnpm test:e2e` with `E2E_EMAIL` and `E2E_PASSWORD` env vars pointing at a seeded account:

```bash
E2E_EMAIL=you@example.com E2E_PASSWORD=yourpassword pnpm test:e2e
```

- [ ] Login page is accessible
- [ ] Unauthenticated redirect works
- [ ] Full workflow: login → import job → see score badge

---

## 14. Known Limitations (acceptable for v1)

| Item | Notes |
|---|---|
| Single user | No multi-tenancy; auth is gated but all data is shared |
| Manual job import only | No browser extension or API scraper |
| No email notifications | Weekly digest goes to Discord only (or logs) |
| Per-platform scoring calibration | Not yet data-driven; uses unified weights |
| AI opportunity ranking via embeddings | Not implemented; sort-by-score is the current ranking |

---

## Sign-off

| Check | Owner | Date |
|---|---|---|
| Schema pushed to Neon prod | | |
| All env vars set in Vercel | | |
| Manual walkthrough complete | | |
| CI green on release commit | | |
