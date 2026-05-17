import { auth } from "@/auth"
import { deleteLead, getLeadById, updateLead } from "@/services/lead.service"
import { z } from "zod"

const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  company: z.string().max(200).optional().nullable(),
  source: z.enum(["linkedin_dm", "referral", "direct", "other"]).optional(),
  notes: z.string().max(5000).optional().nullable(),
  status: z.enum(["new", "contacted", "meeting", "won", "lost"]).optional(),
  value: z.string().optional().nullable(),
})

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const lead = await getLeadById(id)
  if (!lead) return Response.json({ error: "Not found" }, { status: 404 })
  return Response.json(lead)
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const lead = await updateLead(id, parsed.data)
  if (!lead) return Response.json({ error: "Not found" }, { status: 404 })
  return Response.json(lead)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  await deleteLead(id)
  return Response.json({ ok: true })
}
