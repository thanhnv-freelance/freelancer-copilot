import { NextRequest } from "next/server"
import { getAnalyticsData } from "@/services/analytics.service"

async function postToDiscord(webhookUrl: string, kpis: {
  sent: number
  responseRate: number
  winRate: number
  avgHourlyRate: number
  totalRevenue: number
}) {
  const lines = [
    "**📊 Weekly Freelancer Digest**",
    `Proposals sent: **${kpis.sent}**`,
    `Response rate: **${kpis.responseRate}%**`,
    `Win rate: **${kpis.winRate}%**`,
    `Avg hourly rate: **$${kpis.avgHourlyRate}**`,
    `Total revenue: **$${kpis.totalRevenue.toLocaleString()}**`,
  ]
  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: lines.join("\n") }),
  })
}

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

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL
  if (webhookUrl) {
    await postToDiscord(webhookUrl, kpis)
  }

  return Response.json({ ok: true, kpis, discord: !!webhookUrl })
}
