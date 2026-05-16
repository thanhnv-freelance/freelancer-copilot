import { streamText } from "ai"
import { getJobById } from "@/services/job.service"
import { defaultModel } from "@/lib/ai"
import { buildProposalPrompt } from "@/lib/ai/prompts/proposal"

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const job = await getJobById(id)
  if (!job) return new Response("Not found", { status: 404 })

  const result = streamText({
    model: defaultModel,
    prompt: buildProposalPrompt(job),
  })

  return result.toTextStreamResponse()
}
