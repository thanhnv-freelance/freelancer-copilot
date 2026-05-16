"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { ApplicationWithJob } from "@/services/application.service"
import { formatDate } from "@/lib/utils/format"

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-subtle text-muted-foreground",
  submitted:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  interviewing:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  won: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  lost: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
}

const NEXT_STATUS: Record<string, { label: string; value: string }[]> = {
  draft: [{ label: "Mark Submitted", value: "submitted" }],
  submitted: [
    { label: "Interviewing", value: "interviewing" },
    { label: "Lost", value: "lost" },
  ],
  interviewing: [
    { label: "Won", value: "won" },
    { label: "Lost", value: "lost" },
  ],
  won: [],
  lost: [],
}

export function ApplicationList({
  applications,
}: {
  applications: ApplicationWithJob[]
}) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function updateStatus(id: string, status: string) {
    setLoadingId(id)
    await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    setLoadingId(null)
    router.refresh()
  }

  async function deleteApp(id: string) {
    setLoadingId(id)
    await fetch(`/api/applications/${id}`, { method: "DELETE" })
    setLoadingId(null)
    router.refresh()
  }

  if (applications.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground">
        No applications found.{" "}
        <Link href="/jobs" className="underline hover:text-foreground">
          Browse jobs
        </Link>{" "}
        to start tracking.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {applications.map((app) => {
        const isLoading = loadingId === app.id
        const nextStatuses = NEXT_STATUS[app.status] ?? []

        return (
          <div
            key={app.id}
            className="rounded-xl border border-border bg-card p-4 flex flex-col sm:flex-row sm:items-center gap-3"
          >
            <div className="flex-1 min-w-0">
              <Link
                href={`/jobs/${app.jobId}`}
                className="text-sm font-medium text-foreground hover:underline block truncate"
              >
                {app.jobTitle}
              </Link>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[app.status] ?? ""}`}
                >
                  {app.status}
                </span>
                {app.projectValue && (
                  <span className="text-xs text-muted-foreground">
                    ${Number(app.projectValue).toLocaleString()}
                  </span>
                )}
                {app.hourlyRate && (
                  <span className="text-xs text-muted-foreground">
                    ${Number(app.hourlyRate).toLocaleString()}/hr
                  </span>
                )}
                {app.submittedAt && (
                  <span className="text-xs text-muted-foreground">
                    Sent {formatDate(app.submittedAt)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap shrink-0">
              {nextStatuses.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => updateStatus(app.id, value)}
                  disabled={isLoading}
                  className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                >
                  {label}
                </button>
              ))}
              <button
                onClick={() => deleteApp(app.id)}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
