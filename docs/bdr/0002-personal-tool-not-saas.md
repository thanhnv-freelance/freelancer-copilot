# BDR-0002: Personal Tool, Not SaaS

- **Status**: Accepted
- **Date**: 2026-05-17

## Context

The app could be designed as a multi-tenant SaaS (separate freelancer accounts, subscription billing, shared infrastructure). However, this significantly increases upfront complexity: multi-tenancy in DB schema, billing integration, user onboarding, support, and marketing.

The immediate goal is a working daily workflow tool for one freelancer — with portfolio-quality engineering as a secondary goal.

## Decision

**Build for a single user (yourself).** No multi-tenancy, no subscription model, no public sign-up in MVP.

Authentication (NextAuth) is included to protect the dashboard when deployed to Vercel, not to support multiple accounts. The DB schema does not include a `user_id` foreign key on core tables.

## Consequences

- DB schema is simpler — no tenant isolation needed.
- Vercel free tier is sufficient for the entire deployment.
- If the tool proves valuable and a SaaS pivot is desired, the migration path is: add `user_id` to core tables, introduce multi-tenancy middleware, add billing. This is a deliberate future decision, not a current concern.
- The codebase should still be written cleanly enough to serve as a portfolio showcase.
