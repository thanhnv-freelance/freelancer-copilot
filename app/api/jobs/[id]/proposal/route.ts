import { streamText } from "ai"
import { getJobById } from "@/services/job.service"
import { getProfile } from "@/services/profile.service"
import { defaultModel } from "@/lib/ai"
import { buildProposalPrompt } from "@/lib/ai/prompts/proposal"

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const [job, profileData] = await Promise.all([getJobById(id), getProfile()])
  if (!job) return new Response("Not found", { status: 404 })

  const result = streamText({
    model: defaultModel,
    prompt: buildProposalPrompt(job, profileData.bio),
  })

  return result.toTextStreamResponse()
}
