import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"
import { createApplication, getApplications } from "@/services/application.service"
import { z } from "zod"

const createSchema = z.object({
  jobId: z.string().uuid(),
  proposalText: z.string().optional().nullable(),
  status: z
    .enum(["draft", "submitted", "interviewing", "won", "lost"])
    .default("draft"),
  hourlyRate: z.string().optional().nullable(),
  projectValue: z.string().optional().nullable(),
  submittedAt: z.string().datetime().optional().nullable(),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = req.nextUrl
  const result = await getApplications({
    status: searchParams.get("status") ?? undefined,
    jobId: searchParams.get("jobId") ?? undefined,
  })
  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const data = {
    ...parsed.data,
    submittedAt: parsed.data.submittedAt
      ? new Date(parsed.data.submittedAt)
      : undefined,
  }
  const application = await createApplication(data)
  return NextResponse.json(application, { status: 201 })
}
