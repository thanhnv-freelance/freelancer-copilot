import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"
import { createJob, getJobs } from "@/services/job.service"
import { z } from "zod"

const createJobSchema = z.object({
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
  url: z.string().url().optional().nullable().or(z.literal("")),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = req.nextUrl
  const result = await getJobs({
    status: searchParams.get("status") ?? undefined,
    budgetType: searchParams.get("budgetType") ?? undefined,
    source: searchParams.get("source") ?? undefined,
    search: searchParams.get("search") ?? undefined,
  })

  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = createJobSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const job = await createJob(parsed.data)
  return NextResponse.json(job, { status: 201 })
}
