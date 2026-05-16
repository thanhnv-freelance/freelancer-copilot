import { auth } from "@/auth"
import { NextResponse } from "next/server"
import {
  deleteApplication,
  getApplicationById,
  updateApplication,
} from "@/services/application.service"
import { z } from "zod"

const updateSchema = z.object({
  status: z
    .enum(["draft", "submitted", "interviewing", "won", "lost"])
    .optional(),
  hourlyRate: z.string().optional().nullable(),
  projectValue: z.string().optional().nullable(),
  feedback: z.string().optional().nullable(),
  proposalText: z.string().optional().nullable(),
  submittedAt: z.string().datetime().optional().nullable(),
  interviewAt: z.string().datetime().optional().nullable(),
})

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const app = await getApplicationById(id)
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(app)
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { submittedAt, interviewAt, ...rest } = parsed.data
  const data = {
    ...rest,
    ...(submittedAt !== undefined
      ? { submittedAt: submittedAt ? new Date(submittedAt) : null }
      : {}),
    ...(interviewAt !== undefined
      ? { interviewAt: interviewAt ? new Date(interviewAt) : null }
      : {}),
  }

  const updated = await updateApplication(id, data)
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(updated)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  await deleteApplication(id)
  return NextResponse.json({ ok: true })
}
