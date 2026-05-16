import { db } from "@/lib/db"
import { applications, jobs } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { getPlatformLabel } from "@/lib/constants/platforms"

export type WeeklyPoint = { week: string; count: number; revenue: number }
export type FunnelPoint = { status: string; count: number }
export type PlatformPoint = {
  platform: string
  sent: number
  won: number
  winRate: number
}

export type AnalyticsData = {
  kpis: {
    sent: number
    responseRate: number
    winRate: number
    avgHourlyRate: number
    totalRevenue: number
  }
  weekly: WeeklyPoint[]
  funnel: FunnelPoint[]
  platformBreakdown: PlatformPoint[]
}

function getLast12Weeks() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const weeks = []
  for (let i = 11; i >= 0; i--) {
    const end = new Date(today)
    end.setDate(today.getDate() - i * 7)
    const start = new Date(end)
    start.setDate(end.getDate() - 7)
    weeks.push({
      start,
      end,
      label: start.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    })
  }
  return weeks
}

export async function getAnalyticsData(): Promise<AnalyticsData> {
  const all = await db.select().from(applications)

  // KPIs
  const sent = all.filter((a) => a.status !== "draft").length
  const responded = all.filter((a) =>
    ["interviewing", "won", "lost"].includes(a.status)
  ).length
  const won = all.filter((a) => a.status === "won").length
  const closed = all.filter((a) => ["won", "lost"].includes(a.status)).length
  const totalRevenue = all
    .filter((a) => a.status === "won" && a.projectValue)
    .reduce((s, a) => s + Number(a.projectValue), 0)
  const rates = all.filter((a) => a.hourlyRate).map((a) => Number(a.hourlyRate))
  const avgHourlyRate =
    rates.length > 0
      ? Math.round(rates.reduce((s, r) => s + r, 0) / rates.length)
      : 0

  // Weekly time-series
  const weeks = getLast12Weeks()
  const weekly: WeeklyPoint[] = weeks.map(({ start, end, label }) => {
    const weekApps = all.filter((a) => {
      const date = new Date(a.submittedAt ?? a.createdAt)
      return date >= start && date < end
    })
    const count = weekApps.filter((a) => a.status !== "draft").length
    const revenue = weekApps
      .filter((a) => a.status === "won" && a.projectValue)
      .reduce((s, a) => s + Number(a.projectValue), 0)
    return { week: label, count, revenue }
  })

  // Conversion funnel
  const funnel: FunnelPoint[] = [
    {
      status: "Submitted",
      count: all.filter((a) =>
        ["submitted", "interviewing", "won", "lost"].includes(a.status)
      ).length,
    },
    {
      status: "Interviewing",
      count: all.filter((a) => ["interviewing", "won"].includes(a.status))
        .length,
    },
    { status: "Won", count: won },
  ]

  // Per-platform breakdown (join applications → jobs to get source)
  const appsWithSource = await db
    .select({
      status: applications.status,
      source: jobs.source,
    })
    .from(applications)
    .innerJoin(jobs, eq(applications.jobId, jobs.id))

  const platformMap = new Map<string, { sent: number; won: number }>()
  for (const row of appsWithSource) {
    if (row.status === "draft") continue
    const entry = platformMap.get(row.source) ?? { sent: 0, won: 0 }
    entry.sent++
    if (row.status === "won") entry.won++
    platformMap.set(row.source, entry)
  }
  const platformBreakdown: PlatformPoint[] = Array.from(
    platformMap.entries()
  )
    .map(([source, { sent: pSent, won: pWon }]) => ({
      platform: getPlatformLabel(source),
      sent: pSent,
      won: pWon,
      winRate: pSent > 0 ? Math.round((pWon / pSent) * 100) : 0,
    }))
    .sort((a, b) => b.sent - a.sent)

  return {
    kpis: {
      sent,
      responseRate: sent > 0 ? Math.round((responded / sent) * 100) : 0,
      winRate: closed > 0 ? Math.round((won / closed) * 100) : 0,
      avgHourlyRate,
      totalRevenue,
    },
    weekly,
    funnel,
    platformBreakdown,
  }
}
