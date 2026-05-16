import { getJobs } from "@/services/job.service"
import { JobCard } from "@/components/jobs/job-card"
import Link from "next/link"

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "bookmarked", label: "Bookmarked" },
  { value: "applied", label: "Applied" },
  { value: "skipped", label: "Skipped" },
]

const BUDGET_FILTERS = [
  { value: "all", label: "All" },
  { value: "fixed", label: "Fixed" },
  { value: "hourly", label: "Hourly" },
]

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; budgetType?: string }>
}) {
  const params = await searchParams
  const activeStatus = params.status ?? "all"
  const activeBudget = params.budgetType ?? "all"

  const jobs = await getJobs({
    status: activeStatus,
    budgetType: activeBudget,
  })

  function buildUrl(overrides: Record<string, string>) {
    const next = { status: activeStatus, budgetType: activeBudget, ...overrides }
    const qs = Object.entries(next)
      .filter(([, v]) => v !== "all")
      .map(([k, v]) => `${k}=${v}`)
      .join("&")
    return qs ? `/jobs?${qs}` : "/jobs"
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-foreground">
          Jobs
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({jobs.length})
          </span>
        </h1>
        <Link
          href="/jobs/new"
          className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-80 transition-opacity"
        >
          Import Job
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-x-6 gap-y-3 mb-6">
        <div className="flex gap-1.5">
          {STATUS_FILTERS.map(({ value, label }) => (
            <Link
              key={value}
              href={buildUrl({ status: value })}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeStatus === value
                  ? "bg-foreground text-background"
                  : "bg-subtle text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
        <div className="flex gap-1.5">
          {BUDGET_FILTERS.map(({ value, label }) => (
            <Link
              key={value}
              href={buildUrl({ budgetType: value })}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeBudget === value
                  ? "bg-foreground text-background"
                  : "bg-subtle text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* List */}
      {jobs.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-sm">No jobs found.</p>
          <Link
            href="/jobs/new"
            className="text-sm underline mt-1 inline-block hover:text-foreground"
          >
            Import your first job
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  )
}
