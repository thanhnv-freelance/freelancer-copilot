import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { jobs } from "@/lib/db/schema"
import { or, like } from "drizzle-orm"
import { z } from "zod"

const RequestSchema = z.object({
  upworkIds: z.array(z.string()).min(1).max(100),
})

function cors(origin: string | null) {
  const allowed =
    origin?.startsWith("chrome-extension://") ||
    origin?.startsWith("moz-extension://") ||
    origin === "https://www.upwork.com"
  return {
    "Access-Control-Allow-Origin": allowed ? origin! : "null",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Private-Network": "true",
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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: cors(origin) })
  }

  const body = await req.json()
  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400, headers: cors(origin) })
  }

  const { upworkIds } = parsed.data

  // Each Upwork job URL contains ~02{uid}, e.g. ~022044181467850687208
  const rows = await db
    .select({ url: jobs.url })
    .from(jobs)
    .where(or(...upworkIds.map((id) => like(jobs.url, `%~02${id}%`))))

  // Map back to upworkIds that were found
  const existing = upworkIds.filter((id) =>
    rows.some((r) => r.url?.includes(`~02${id}`))
  )

  return NextResponse.json({ existing }, { headers: cors(origin) })
}
