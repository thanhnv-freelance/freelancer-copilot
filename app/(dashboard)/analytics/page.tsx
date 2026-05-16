import { getAnalyticsData } from "@/services/analytics.service"
import {
  ActivityChart,
  FunnelChart,
  PlatformChart,
  RevenueChart,
} from "@/components/analytics/analytics-charts"

function KpiCard({
  label,
  value,
  sub,
}: {
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-2xl font-semibold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  )
}

function ChartCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="text-sm font-medium text-foreground mb-4">{title}</h2>
      {children}
    </div>
  )
}

export default async function AnalyticsPage() {
  const { kpis, weekly, funnel, platformBreakdown } = await getAnalyticsData()

  const kpiCards = [
    { label: "Proposals Sent", value: String(kpis.sent) },
    { label: "Response Rate", value: `${kpis.responseRate}%` },
    { label: "Win Rate", value: `${kpis.winRate}%` },
    {
      label: "Avg Hourly Rate",
      value: kpis.avgHourlyRate > 0 ? `$${kpis.avgHourlyRate}/hr` : "—",
    },
    {
      label: "Total Revenue",
      value:
        kpis.totalRevenue > 0
          ? `$${kpis.totalRevenue.toLocaleString()}`
          : "—",
    },
  ]

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-xl font-semibold text-foreground">Analytics</h1>

      {/* KPI row */}
      <section>
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
          Summary
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {kpiCards.map(({ label, value }) => (
            <KpiCard key={label} label={label} value={value} />
          ))}
        </div>
      </section>

      {/* Charts row */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Applications Sent per Week">
          <ActivityChart data={weekly} />
        </ChartCard>

        <ChartCard title="Revenue Over Time">
          <RevenueChart data={weekly} />
        </ChartCard>
      </section>

      {/* Platform breakdown */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Platform Performance (Sent vs Won)">
          <PlatformChart data={platformBreakdown} />
        </ChartCard>

        {/* Platform win-rate table */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-medium text-foreground mb-4">
            Platform Win Rates
          </h2>
          {platformBreakdown.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground border-b border-border">
                  <th className="text-left pb-2 font-medium">Platform</th>
                  <th className="text-right pb-2 font-medium">Sent</th>
                  <th className="text-right pb-2 font-medium">Won</th>
                  <th className="text-right pb-2 font-medium">Win Rate</th>
                </tr>
              </thead>
              <tbody>
                {platformBreakdown.map((row) => (
                  <tr key={row.platform} className="border-b border-border last:border-0">
                    <td className="py-2 text-foreground">{row.platform}</td>
                    <td className="py-2 text-right tabular-nums text-muted-foreground">{row.sent}</td>
                    <td className="py-2 text-right tabular-nums text-muted-foreground">{row.won}</td>
                    <td className="py-2 text-right tabular-nums font-medium">
                      {row.winRate > 0 ? (
                        <span className="text-green-600 dark:text-green-400">{row.winRate}%</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Funnel */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Conversion Funnel">
          <FunnelChart data={funnel} />
        </ChartCard>

        {/* Weekly KPI table */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-medium text-foreground mb-4">
            Weekly Summary
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground border-b border-border">
                  <th className="text-left pb-2 font-medium">Week</th>
                  <th className="text-right pb-2 font-medium">Sent</th>
                  <th className="text-right pb-2 font-medium">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {[...weekly].reverse().map((row) => (
                  <tr
                    key={row.week}
                    className="border-b border-border last:border-0"
                  >
                    <td className="py-2 text-muted-foreground">{row.week}</td>
                    <td className="py-2 text-right tabular-nums">
                      {row.count > 0 ? row.count : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-2 text-right tabular-nums">
                      {row.revenue > 0 ? (
                        `$${row.revenue.toLocaleString()}`
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
