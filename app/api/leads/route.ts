import { auth } from "@/auth"
import { createLead, getLeads } from "@/services/lead.service"
import { NextRequest } from "next/server"
import { z } from "zod"

const createSchema = z.object({
  name: z.string().min(1).max(200),
  company: z.string().max(200).optional().nullable(),
  source: z.enum(["linkedin_dm", "referral", "direct", "other"]).default("linkedin_dm"),
  notes: z.string().max(5000).optional().nullable(),
  status: z.enum(["new", "contacted", "meeting", "won", "lost"]).default("new"),
  value: z.string().optional().nullable(),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = req.nextUrl
  const result = await getLeads({
    status: searchParams.get("status") ?? undefined,
    source: searchParams.get("source") ?? undefined,
  })
  return Response.json(result)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const lead = await createLead(parsed.data)
  return Response.json(lead, { status: 201 })
}
