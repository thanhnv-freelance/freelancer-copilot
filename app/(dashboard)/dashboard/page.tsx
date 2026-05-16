import { getJobStats } from "@/services/job.service"
import { getApplicationStats } from "@/services/application.service"
import Link from "next/link"

export default async function DashboardPage() {
  const [jobStats, appStats] = await Promise.all([
    getJobStats(),
    getApplicationStats(),
  ])

  const jobCards = [
    { label: "Total Jobs", value: jobStats.total, href: "/jobs" },
    { label: "New", value: jobStats.new, href: "/jobs?status=new" },
    { label: "Bookmarked", value: jobStats.bookmarked, href: "/jobs?status=bookmarked" },
    { label: "Applied", value: jobStats.applied, href: "/jobs?status=applied" },
    { label: "Skipped", value: jobStats.skipped, href: "/jobs?status=skipped" },
  ]

  const appCards = [
    {
      label: "Proposals Sent",
      value: String(appStats.sent),
      href: "/applications?status=submitted",
    },
    {
      label: "Response Rate",
      value: `${appStats.responseRate}%`,
      href: "/applications?status=interviewing",
    },
    {
      label: "Win Rate",
      value: `${appStats.winRate}%`,
      href: "/applications?status=won",
    },
    {
      label: "Revenue",
      value: appStats.revenue > 0 ? `$${appStats.revenue.toLocaleString()}` : "—",
      href: "/applications?status=won",
    },
  ]

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>

      <section>
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
          Jobs
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {jobCards.map(({ label, value, href }) => (
            <Link
              key={label}
              href={href}
              className="rounded-xl border border-border bg-card p-4 hover:border-foreground/30 transition-colors"
            >
              <p className="text-xs text-muted-foreground mb-1">{label}</p>
              <p className="text-2xl font-semibold text-foreground">{value}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
          Applications
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {appCards.map(({ label, value, href }) => (
            <Link
              key={label}
              href={href}
              className="rounded-xl border border-border bg-card p-4 hover:border-foreground/30 transition-colors"
            >
              <p className="text-xs text-muted-foreground mb-1">{label}</p>
              <p className="text-2xl font-semibold text-foreground">{value}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
