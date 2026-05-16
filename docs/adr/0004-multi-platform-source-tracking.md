# ADR-0004: Multi-Platform Source Tracking

- **Status**: Accepted
- **Date**: 2026-05-17
- **Related**: [BDR-0003](../bdr/0003-multi-channel-platform-strategy.md)

## Context

Following BDR-0003's decision to support a multi-channel sourcing strategy, the app needed to record which platform each job came from and surface that data in the UI and analytics.

The `jobs` table already had a `source TEXT NOT NULL DEFAULT 'upwork'` column from Phase 1 — a forward-looking decision in BDR-0001. However, it was invisible: not exposed in the import form, not filterable in the job list, and not used in analytics.

## Decision

### Platform Registry — `lib/constants/platforms.ts`

Define a single authoritative list of supported platforms as a typed constant. All UI (import form dropdown, filter pills, badges, chart labels) derive from this list — no hard-coded platform strings outside this file.

```
upwork | contra | linkedin | wellfound | braintrust | arc | other
```

`other` serves as a catch-all for direct leads, referrals, and platforms not yet listed.

### Job Import Form

Add a **Platform** selector as the first field in the import form (`/jobs/new`). Defaults to `upwork` to preserve existing behaviour for users not changing the selection. The URL field label was generalised from "Upwork URL" to "Job URL".

### Job List Filter

Add a platform filter pill row to `/jobs`, parallel to the existing status and budget filters. The `source` param is carried through the URL and passed to `getJobs()` via the `JobFilters` type.

### Job Card

Display a muted platform badge alongside the status badge on each job card. This makes platform visible at a glance without requiring the filter to be set.

### Analytics — Per-Platform Breakdown

Extend `getAnalyticsData()` in `services/analytics.service.ts` to compute `platformBreakdown`:

```ts
{ platform: string; sent: number; won: number; winRate: number }[]
```

This is derived by joining `applications → jobs` to get the source, then grouping by source. Only non-draft applications count as "sent". Results are sorted by sent volume descending.

The analytics page renders:
- A grouped horizontal bar chart (Sent vs Won per platform) — `PlatformChart`
- A win-rate summary table (platform / sent / won / win rate %)

## Alternatives Considered

**Add a separate `platform` table with a foreign key** — rejected. The platform list is small and stable enough to be a typed constant. A DB lookup table would add complexity with no benefit at this scale.

**Infer platform from the job URL** — rejected. URLs are optional and differ in format across platforms. A user-selected dropdown is simpler and more reliable.

**Store platform in the `applications` table** — rejected. The platform is a property of the job opportunity, not the application. Storing it on `jobs` is semantically correct and avoids duplication.

## Consequences

- All platform display and filtering flows through `lib/constants/platforms.ts`. Adding a new platform requires only adding one entry to that array.
- Existing jobs in the database have `source = 'upwork'` (the column default) and will correctly show as "Upwork" without any migration.
- The scoring engine is unaffected — it reads scoring signals (proposal count, payment verified, etc.) that are platform-agnostic at the code level, even though the weights were calibrated for Upwork.
- Per-platform win-rate data will be sparse initially. The analytics chart is designed to handle empty states gracefully.
