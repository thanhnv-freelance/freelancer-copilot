# BDR-0003: Multi-Channel Platform Strategy

- **Status**: Accepted
- **Date**: 2026-05-17
- **Supersedes**: [BDR-0001](./0001-upwork-only-mvp-focus.md)

## Context

BDR-0001 scoped the MVP to Upwork only to reduce initial complexity. After the core workflow (job import → scoring → proposal generation → application tracking) was proven in Phases 1–5, a strategy review identified a critical gap.

Depending on a single platform creates several risks and missed opportunities:

- **Cost exposure**: Upwork's "Connects" system makes high-volume prospecting expensive. Burning credits on low-fit applications is a structural drain.
- **Quality ceiling**: Upwork rewards bid volume and response speed over demonstrated expertise. Senior backend/cloud specialists are underpriced in this dynamic.
- **Missed inbound channels**: Platforms like Contra, Wellfound, and LinkedIn reward portfolio quality and domain authority — channels that align better with a backend/cloud/platform engineering background (Java, Spring Boot, AWS, payments, BPM).

The strategy review produced a clear recommendation:

> "Your strongest path is NOT mass bidding for small gigs. Your strongest path is becoming a visible backend/cloud specialist."

A multi-channel approach was recommended with each channel serving a distinct goal:

| Channel       | Goal                    |
|---------------|-------------------------|
| Upwork        | Initial reviews         |
| Contra        | Portfolio-led leads     |
| Wellfound     | Startup contracts       |
| LinkedIn      | Authority / inbound     |
| Braintrust    | Senior engineering work |
| Arc.dev       | Remote dev market       |

## Decision

**Expand platform support from Upwork-only to a multi-channel model.**

The app now supports the following platforms as first-class job sources:

- Upwork
- Contra
- LinkedIn
- Wellfound
- Braintrust
- Arc.dev
- Other (catch-all for direct/referral/inbound)

Each imported job is tagged with its source platform. The jobs list is filterable by platform. The analytics dashboard reports per-platform conversion metrics (sent vs won, win rate) so the highest-ROI channels can be identified empirically over time.

Job import remains manual (paste-based). No platform API integrations in this phase — the overhead of OAuth and per-platform API maintenance is not justified until volume warrants it.

## Consequences

- The `source` field on the `jobs` table (already present from Phase 1, defaulting to `"upwork"`) is now surfaced in the UI rather than treated as an invisible default.
- Scoring signals (proposal count, hire rate, payment verified) remain Upwork-specific. For non-Upwork jobs these fields are optional — the scoring engine gracefully handles null values.
- Platform performance data will accumulate over time and inform channel prioritisation. Expected outcome: 2–3 platforms will drive the majority of wins; the others can be deprioritised.
- A future ADR should address per-platform scoring weight adjustments once enough data exists to calibrate them.
- If inbound leads (LinkedIn DMs, referrals) become significant, the data model may need a `lead_source` distinction separate from the `source` field which currently represents the job board.
