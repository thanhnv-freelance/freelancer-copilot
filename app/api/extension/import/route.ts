import { NextRequest, NextResponse } from "next/server"
import { createJob } from "@/services/job.service"
import { computeAndSaveScore } from "@/services/scoring.service"
import { z } from "zod"

const importSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  budgetType: z.enum(["fixed", "hourly"]).default("fixed"),
  budgetMin: z.string().optional().nullable(),
  budgetMax: z.string().optional().nullable(),
  skills: z.array(z.string()).default([]),
  proposalCount: z.number().int().optional().nullable(),
  clientName: z.string().optional().nullable(),
  clientRating: z.string().optional().nullable(),
  clientHireRate: z.string().optional().nullable(),
  clientTotalSpent: z.string().optional().nullable(),
  paymentVerified: z.boolean().default(false),
  url: z.string().optional().nullable(),
  source: z.string().default("upwork"),
})

function cors(origin: string | null) {
  const allowed =
    origin?.startsWith("chrome-extension://") ||
    origin?.startsWith("moz-extension://")
  return {
    "Access-Control-Allow-Origin": allowed ? origin! : "null",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
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
  const parsed = importSchema.safeParse(body)
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
