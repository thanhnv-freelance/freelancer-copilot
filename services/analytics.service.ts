import { db } from "@/lib/db"
import { applications } from "@/lib/db/schema"

export type WeeklyPoint = { week: string; count: number; revenue: number }
export type FunnelPoint = { status: string; count: number }

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
  }
}
