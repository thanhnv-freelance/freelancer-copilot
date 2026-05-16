# BDR-0001: Upwork-Only Focus for MVP

- **Status**: Superseded by [BDR-0003](./0003-multi-channel-platform-strategy.md)
- **Date**: 2026-05-17
- **Superseded**: 2026-05-17

## Context

Freelancing platforms differ significantly in their job structure, proposal mechanics, and client behavior. Supporting multiple platforms (Upwork, Freelancer, Fiverr, LinkedIn) in the MVP would require abstracting job formats, handling different scoring signals, and maintaining multiple import flows — all before the core workflow is proven.

## Decision

**MVP supports Upwork only.**

Job import is manual: paste job details from Upwork into the app. No API integration or browser extension in MVP.

Scoring signals are calibrated to Upwork-specific factors:
- proposal count (Upwork shows "5–10 proposals")
- payment verified badge
- client hire rate and total spend
- hourly vs fixed-price budget

## Consequences

- The `jobs` table schema and scoring weights are Upwork-specific for now. A `source` column is included to support multi-platform data in the future without a schema migration.
- No Upwork API integration — manual import keeps the MVP simple and avoids OAuth complexity.
- Multi-platform support is a post-MVP decision (see Future Features in `init.md`).
