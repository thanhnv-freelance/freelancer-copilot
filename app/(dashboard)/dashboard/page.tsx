import { getJobStats } from "@/services/job.service"
import Link from "next/link"

export default async function DashboardPage() {
  const stats = await getJobStats()

  const cards = [
    { label: "Total Jobs", value: stats.total, href: "/jobs" },
    { label: "New", value: stats.new, href: "/jobs?status=new" },
    { label: "Bookmarked", value: stats.bookmarked, href: "/jobs?status=bookmarked" },
    { label: "Applied", value: stats.applied, href: "/jobs?status=applied" },
    { label: "Skipped", value: stats.skipped, href: "/jobs?status=skipped" },
  ]

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-foreground mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {cards.map(({ label, value, href }) => (
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
    </div>
  )
}
