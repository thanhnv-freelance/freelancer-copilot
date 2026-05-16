# ADR-0001: Tech Stack and Local Development Environment

- **Status**: Accepted
- **Date**: 2026-05-17

## Context

Development happens on a MacBook M1 with shared unified memory. The stack must stay lightweight, support fast hot-reload, and keep operational cost minimal. The app is a personal productivity tool — a single freelancer's daily workflow — so infrastructure complexity should be kept low.

AI features (proposal generation, job summarization) require streaming responses from an LLM provider.

## Decision

### Framework — Next.js 15 (App Router, Turbopack)

Use Next.js 15 with the App Router. Start the dev server with `--turbo` to use the Turbopack bundler for faster cold-start and hot-reload.

```bash
next dev --turbo
```

### Styling — TailwindCSS v4

Use TailwindCSS v4 (`@tailwindcss/postcss`) for all styling. No component library installs without a new ADR.

### AI Integration — Vercel AI SDK

Use the Vercel AI SDK (`ai` package) with `@ai-sdk/anthropic` as the primary provider (Claude) and `@ai-sdk/openai` as fallback. The SDK abstracts streaming and provider switching — swapping models requires only changing the model config, not application code.

All streaming UI uses `useChat` or `useCompletion` hooks. No custom streaming abstractions.

### Database — PostgreSQL via Neon

Use Neon serverless PostgreSQL. Free tier is sufficient for a single-user personal tool. The `postgres` npm package is used as the DB driver (not `pg`).

### ORM — Drizzle ORM

TypeScript-first, lightweight, excellent SQL visibility. Drizzle Kit for migrations, prefixed with `dotenv -e .env.local --` to load local env vars.

### Authentication — NextAuth v5

Standard for Next.js App Router. Handles session management for the single-user dashboard.

### Package Manager — pnpm

pnpm for faster installs and disk efficiency.

### Testing — Vitest + Playwright

Vitest for unit tests (scoring engine, utilities). Playwright for E2E tests.

## Consequences

- `pnpm dev` (mapped to `next dev --turbo`) is the canonical dev command; Webpack mode should not be used.
- The Vercel AI SDK's `useChat`/`useCompletion` hooks are the standard pattern for all streaming UI — do not introduce a separate streaming abstraction.
- When switching between Claude and OpenAI, only the model config in `lib/ai/` changes; no component code should require modification.
- TailwindCSS is the only permitted styling approach.
- All DB scripts use `dotenv -e .env.local --` prefix to load environment variables.
