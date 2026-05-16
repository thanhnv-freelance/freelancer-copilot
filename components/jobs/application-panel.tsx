"use client"

import { useState } from "react"
import Link from "next/link"
import type { ApplicationWithJob } from "@/services/application.service"

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

export function ApplicationPanel({
  jobId,
  initial,
}: {
  jobId: string
  initial: ApplicationWithJob | null
}) {
  const [app, setApp] = useState(initial)
  const [loading, setLoading] = useState(false)

  async function createApplication() {
    setLoading(true)
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId, status: "draft" }),
    })
    const created = await res.json()
    // Fetch full ApplicationWithJob (includes jobTitle)
    const full = await fetch(`/api/applications/${created.id}`).then((r) =>
      r.json()
    )
    setApp(full)
    setLoading(false)
  }

  async function updateStatus(status: string) {
    if (!app) return
    setLoading(true)
    await fetch(`/api/applications/${app.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    setApp((prev) => (prev ? { ...prev, status } : null))
    setLoading(false)
  }

  const nextStatuses = app ? (NEXT_STATUS[app.status] ?? []) : []

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-foreground">Application</h2>
        <Link
          href="/applications"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          View tracker
        </Link>
      </div>

      {app ? (
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[app.status] ?? ""}`}
          >
            {app.status}
          </span>
          {nextStatuses.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => updateStatus(value)}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              {label}
            </button>
          ))}
        </div>
      ) : (
        <div>
          <p className="text-sm text-muted-foreground mb-3">
            Track this application through its lifecycle.
          </p>
          <button
            onClick={createApplication}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            {loading ? "Creating…" : "Track Application"}
          </button>
        </div>
      )}
    </div>
  )
}
