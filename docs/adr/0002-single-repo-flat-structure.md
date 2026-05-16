# ADR-0002: Single Repository, Flat Next.js Structure (No Monorepo)

- **Status**: Accepted
- **Date**: 2026-05-17

## Context

This is a single-user personal tool. There is no separate public API, no shared packages between multiple apps, and no other team members. A monorepo (pnpm workspaces with `apps/` and `packages/`) would add setup overhead with no benefit at this scale.

## Decision

Use a **single Next.js 15 app** at the repo root — no `apps/` or `packages/` workspace structure. The App Router's `app/api/` directory serves as the backend layer (Backend-for-Frontend pattern).

```
freelancer-copilot/
├── app/               # Next.js App Router (pages + API routes)
│   ├── (dashboard)/
│   ├── jobs/
│   ├── analytics/
│   ├── settings/
│   └── api/
├── components/        # Reusable UI components
├── lib/               # Domain logic (framework-agnostic)
│   ├── ai/
│   ├── constants/
│   ├── db/
│   ├── scoring/
│   └── parser/
├── services/          # Business logic called by API routes
├── drizzle/           # Migration files
└── docs/              # ADRs, BDRs
```

Domain logic lives in `lib/` with no Next.js imports, keeping it independently testable. API route handlers are thin: validate input → call `lib/` or `services/` → return response. Business logic must not live inside route files.

## Consequences

- No monorepo tooling to configure or maintain.
- If the tool ever needs a standalone backend (e.g., background job processor), extract `lib/` into a separate service at that point.
- All development runs from the repo root with a single `pnpm dev`.
