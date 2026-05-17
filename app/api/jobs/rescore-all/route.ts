import { auth } from "@/auth"
import { getJobs } from "@/services/job.service"
import { computeAndSaveScore } from "@/services/scoring.service"

export async function POST() {
  const session = await auth()
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const jobs = await getJobs()
  await Promise.all(jobs.map((job) => computeAndSaveScore(job)))

  return Response.json({ ok: true, rescored: jobs.length })
}
