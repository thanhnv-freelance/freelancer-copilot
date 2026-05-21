import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"
import { createJob, getJobs } from "@/services/job.service"
import { jobSchema } from "@/lib/validation/job.schema"

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
  const parsed = jobSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const job = await createJob(parsed.data)
  return NextResponse.json(job, { status: 201 })
}
