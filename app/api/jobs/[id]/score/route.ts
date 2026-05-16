import { getJobById } from "@/services/job.service"
import { getScoreForJob, computeAndSaveScore } from "@/services/scoring.service"
import { NextResponse } from "next/server"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const score = await getScoreForJob(id)
  return NextResponse.json(score)
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const job = await getJobById(id)
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 })
  const result = await computeAndSaveScore(job)
  return NextResponse.json(result)
}
