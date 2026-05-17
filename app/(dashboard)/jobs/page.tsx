import { getJobs } from "@/services/job.service"
import { getLatestScoresForJobs } from "@/services/scoring.service"
import { JobCard } from "@/components/jobs/job-card"
import { RescoreAllButton } from "@/components/jobs/rescore-all-button"
import { PLATFORMS } from "@/lib/constants/platforms"
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

const SOURCE_FILTERS = [
  { value: "all", label: "All Platforms" },
  ...PLATFORMS,
]

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; budgetType?: string; source?: string }>
}) {
  const params = await searchParams
  const activeStatus = params.status ?? "all"
  const activeBudget = params.budgetType ?? "all"
  const activeSource = params.source ?? "all"

  const jobs = await getJobs({
    status: activeStatus,
    budgetType: activeBudget,
    source: activeSource,
  })
  const scores = await getLatestScoresForJobs(jobs.map((j) => j.id))
  const sorted = [...jobs].sort((a, b) => {
    const sa = scores.get(a.id) ?? -1
    const sb = scores.get(b.id) ?? -1
    return sb - sa
  })

  function buildUrl(overrides: Record<string, string>) {
    const next = { status: activeStatus, budgetType: activeBudget, source: activeSource, ...overrides }
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
        <div className="flex items-center gap-2">
          <RescoreAllButton />
          <Link
            href="/jobs/new"
            className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-80 transition-opacity"
          >
            Import Job
          </Link>
        </div>
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
        <div className="flex gap-1.5 flex-wrap">
          {SOURCE_FILTERS.map(({ value, label }) => (
            <Link
              key={value}
              href={buildUrl({ source: value })}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeSource === value
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
      {sorted.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground space-y-3">
          {activeStatus === "all" && activeBudget === "all" && activeSource === "all" ? (
            <>
              <p className="text-sm font-medium text-foreground">No jobs yet</p>
              <p className="text-sm">
                Set up your{" "}
                <Link href="/settings" className="underline hover:text-foreground">
                  profile
                </Link>{" "}
                first, then import your first job.
              </p>
              <Link
                href="/jobs/new"
                className="inline-block rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-80 transition-opacity"
              >
                Import a job
              </Link>
            </>
          ) : (
            <p className="text-sm">No jobs match the selected filters.</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((job) => (
            <JobCard key={job.id} job={job} score={scores.get(job.id)} />
          ))}
        </div>
      )}
    </div>
  )
}
