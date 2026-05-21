import { NextRequest, NextResponse } from "next/server"
import { createJob } from "@/services/job.service"
import { computeAndSaveScore } from "@/services/scoring.service"
import { jobSchema } from "@/lib/validation/job.schema"
import { PLATFORM_WEB_ORIGINS } from "@/lib/constants/platforms"

function cors(origin: string | null) {
  const allowed =
    origin?.startsWith("chrome-extension://") ||
    origin?.startsWith("moz-extension://") ||
    (origin !== null && PLATFORM_WEB_ORIGINS.has(origin))
  return {
    "Access-Control-Allow-Origin": allowed ? origin! : "null",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Private-Network": "true",
  }
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: cors(req.headers.get("origin")),
  })
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin")

  const key = req.headers.get("authorization")?.replace("Bearer ", "")
  if (!process.env.EXTENSION_API_KEY || key !== process.env.EXTENSION_API_KEY) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: cors(origin) }
    )
  }

  const body = await req.json()
  const parsed = jobSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400, headers: cors(origin) }
    )
  }

  const job = await createJob(parsed.data)
  await computeAndSaveScore(job)

  return NextResponse.json(
    { id: job.id },
    { status: 201, headers: cors(origin) }
  )
}
