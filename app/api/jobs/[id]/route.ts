import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"
import { updateJobStatus } from "@/services/job.service"
import { z } from "zod"

const patchSchema = z.object({
  status: z.enum(["new", "viewed", "bookmarked", "applied", "skipped"]),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  await updateJobStatus(id, parsed.data.status)
  return NextResponse.json({ success: true })
}
