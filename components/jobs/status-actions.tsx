'use client'

import { useRouter } from "next/navigation"
import { useState } from "react"

const ACTIONS = [
  {
    status: "bookmarked",
    label: "Bookmark",
    activeClass: "bg-amber-100 border-amber-300 text-amber-700 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-400",
    inactiveClass: "border-border text-muted-foreground hover:text-foreground",
  },
  {
    status: "applied",
    label: "Mark Applied",
    activeClass: "bg-green-100 border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-400",
    inactiveClass: "border-border text-muted-foreground hover:text-foreground",
  },
  {
    status: "skipped",
    label: "Skip",
    activeClass: "bg-subtle border-border text-faint",
    inactiveClass: "border-border text-muted-foreground hover:text-foreground",
  },
]

export function StatusActions({
  jobId,
  currentStatus,
}: {
  jobId: string
  currentStatus: string
}) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function updateStatus(status: string) {
    await fetch(`/api/jobs/${jobId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    router.refresh()
  }

  async function handleDelete() {
    if (!confirm("Delete this job? This cannot be undone.")) return
    setDeleting(true)
    await fetch(`/api/jobs/${jobId}`, { method: "DELETE" })
    router.push("/jobs")
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {ACTIONS.map(({ status, label, activeClass, inactiveClass }) => {
        const active = currentStatus === status
        return (
          <button
            key={status}
            onClick={() => updateStatus(active ? "new" : status)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              active ? activeClass : inactiveClass
            }`}
          >
            {label}
          </button>
        )
      })}
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-red-500 hover:bg-red-500/10 hover:border-red-500/50 transition-colors disabled:opacity-40"
      >
        {deleting ? "Deleting…" : "Delete"}
      </button>
    </div>
  )
}
