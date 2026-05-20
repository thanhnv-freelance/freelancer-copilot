import { generateObject } from "ai"
import { z } from "zod"
import { defaultModel } from "@/lib/ai"
import { ParsedJobSchema, buildParsePrompt } from "@/lib/ai/prompts/parse"

const RequestSchema = z.object({
  text: z.string().min(50).max(15000),
})

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: "Invalid input" }, { status: 400 })
  }

  const result = await generateObject({
    model: defaultModel,
    schema: ParsedJobSchema,
    prompt: buildParsePrompt(parsed.data.text),
  })

  return Response.json(result.object)
}
