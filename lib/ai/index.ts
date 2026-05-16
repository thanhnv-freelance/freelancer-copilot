import { anthropic } from "@ai-sdk/anthropic"
import { openai } from "@ai-sdk/openai"

// Primary: Claude — best instruction-following for proposal generation
export const defaultModel = anthropic(
  process.env.AI_MODEL ?? "claude-sonnet-4-5"
)

// Fallback: OpenAI — swap by changing the model passed to generateText/streamText
export const fallbackModel = openai("gpt-4o")
