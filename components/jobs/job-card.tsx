import Link from "next/link"
import type { Job } from "@/lib/db/schema"
import { formatBudget, formatDate } from "@/lib/utils/format"

const STATUS_STYLES: Record<string, string> = {
  new: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  viewed: "bg-subtle text-muted-foreground",
  bookmarked: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  applied: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  skipped: "bg-subtle text-faint",
}

export function JobCard({ job }: { job: Job }) {
  const skills = (job.skills as string[]) ?? []

  return (
    <Link
      href={`/jobs/${job.id}`}
      className="block rounded-xl border border-border bg-card p-4 hover:border-foreground/20 transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-medium text-foreground truncate mb-1">
            {job.title}
          </h2>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {job.description}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {skills.slice(0, 5).map((skill) => (
              <span
                key={skill}
                className="px-2 py-0.5 rounded-full bg-subtle text-xs text-muted-foreground"
              >
                {skill}
              </span>
            ))}
            {skills.length > 5 && (
              <span className="px-2 py-0.5 rounded-full bg-subtle text-xs text-faint">
                +{skills.length - 5}
              </span>
            )}
          </div>
        </div>

        <div className="shrink-0 text-right space-y-1.5">
          <span
            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[job.status] ?? STATUS_STYLES.new}`}
          >
            {job.status}
          </span>
          <p className="text-sm font-medium text-foreground">
            {formatBudget(job)}
          </p>
          {job.proposalCount !== null && (
            <p className="text-xs text-muted-foreground">
              {job.proposalCount} proposals
            </p>
          )}
          {job.paymentVerified && (
            <p className="text-xs text-green-600 dark:text-green-400">
              Verified
            </p>
          )}
          <p className="text-xs text-faint">{formatDate(job.createdAt)}</p>
        </div>
      </div>
    </Link>
  )
}
