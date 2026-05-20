import { streamText } from "ai"
import { getJobById } from "@/services/job.service"
import { getProfile } from "@/services/profile.service"
import { defaultModel } from "@/lib/ai"
import { buildAnalysisPrompt } from "@/lib/ai/prompts/analysis"

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const [job, profile] = await Promise.all([getJobById(id), getProfile()])
  if (!job) return new Response("Not found", { status: 404 })

  const result = streamText({
    model: defaultModel,
    prompt: buildAnalysisPrompt(job, profile),
  })

  return result.toTextStreamResponse()
}
