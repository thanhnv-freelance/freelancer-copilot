"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function RescoreAllButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState<number | null>(null)

  async function handleClick() {
    setLoading(true)
    setDone(null)
    const res = await fetch("/api/jobs/rescore-all", { method: "POST" })
    const data = await res.json()
    setDone(data.rescored ?? 0)
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2">
      {done !== null && (
        <span className="text-xs text-muted-foreground">
          Re-scored {done} jobs
        </span>
      )}
      <button
        onClick={handleClick}
        disabled={loading}
        className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
      >
        {loading ? "Scoring…" : "Re-score All"}
      </button>
    </div>
  )
}
