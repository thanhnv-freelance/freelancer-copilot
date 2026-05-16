import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { getAnalyticsData } from "@/services/analytics.service"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const data = await getAnalyticsData()
  return NextResponse.json(data)
}
