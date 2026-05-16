'use client'

import { useRouter } from "next/navigation"

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

  async function updateStatus(status: string) {
    await fetch(`/api/jobs/${jobId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    router.refresh()
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
    </div>
  )
}
