import { NextRequest } from "next/server"
import { getAnalyticsData } from "@/services/analytics.service"

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  if (!token || token !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const data = await getAnalyticsData()
  const { kpis } = data

  console.log("[weekly-digest]", {
    sent: kpis.sent,
    responseRate: `${kpis.responseRate}%`,
    winRate: `${kpis.winRate}%`,
    avgHourlyRate: `$${kpis.avgHourlyRate}`,
    totalRevenue: `$${kpis.totalRevenue}`,
  })

  return Response.json({ ok: true, kpis })
}
