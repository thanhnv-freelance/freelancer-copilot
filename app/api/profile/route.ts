import { auth } from "@/auth"
import { getProfile, upsertProfile } from "@/services/profile.service"
import { z } from "zod"

export async function GET() {
  const session = await auth()
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const profile = await getProfile()
  return Response.json(profile)
}

const updateSchema = z.object({
  name: z.string().max(100).optional().default(""),
  bio: z.string().max(2000).optional().default(""),
  skills: z.array(z.string().max(60)).max(50),
  minFixedBudget: z.number().min(0).max(1_000_000),
  minHourlyRate: z.number().min(0).max(10_000),
})

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const profile = await upsertProfile(parsed.data)
  return Response.json(profile)
}
