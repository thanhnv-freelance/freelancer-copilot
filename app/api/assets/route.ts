import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"
import { createAsset, getAssets } from "@/services/asset.service"
import { z } from "zod"

const createSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  category: z.enum(["proposal", "intro", "architecture", "checklist"]).default("proposal"),
  tags: z.array(z.string()).default([]),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = req.nextUrl
  const result = await getAssets({
    category: searchParams.get("category") ?? undefined,
    search: searchParams.get("search") ?? undefined,
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

  const asset = await createAsset(parsed.data)
  return NextResponse.json(asset, { status: 201 })
}
