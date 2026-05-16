# ADR-0003: AI Provider Strategy — Claude Primary, OpenAI Fallback

- **Status**: Accepted
- **Date**: 2026-05-17

## Context

The app requires AI for three tasks:
1. Summarizing job requirements
2. Generating proposal drafts (streaming)
3. Scoring and risk analysis reasoning

Multiple providers exist (Claude, OpenAI, local Ollama). Tying the app to a single provider's SDK makes switching expensive. Cost and output quality also differ per task.

## Decision

Use the **Vercel AI SDK** as the abstraction layer. Configure providers in `lib/ai/` only — no provider-specific imports anywhere else in the codebase.

- **Primary provider**: Anthropic Claude (`@ai-sdk/anthropic`) — better instruction-following and longer context for proposal generation
- **Fallback provider**: OpenAI (`@ai-sdk/openai`) — switchable by changing the model config in `lib/ai/`
- **Local option**: `ollama-ai-provider` can be plugged in for offline development if needed

Prompt templates are defined as plain TypeScript functions in `lib/ai/prompts/`. They receive structured inputs and return a prompt string — no provider coupling.

Streaming responses use `streamText` on the server and `useCompletion` / `useChat` on the client.

## Consequences

- Switching provider = changing one import and model name in `lib/ai/config.ts`. No component code changes.
- Both `ANTHROPIC_API_KEY` and `OPENAI_API_KEY` are required in `.env.local` even if only one is active, to support quick switching.
- All AI calls go through `lib/ai/` — direct `fetch` to provider APIs is not permitted.
