"use client"

import { useState } from "react"
import { ScoreBadge } from "./score-badge"
import type { ScoringResult } from "@/lib/db/schema"

interface ReasoningItem {
  factor: string
  delta: number
  note: string
}

export function ScorePanel({
  jobId,
  initial,
}: {
  jobId: string
  initial: ScoringResult | null
}) {
  const [result, setResult] = useState<ScoringResult | null>(initial)
  const [loading, setLoading] = useState(false)

  async function handleScore() {
    setLoading(true)
    const res = await fetch(`/api/jobs/${jobId}/score`, { method: "POST" })
    const data = await res.json()
    setResult(data)
    setLoading(false)
  }

  const reasoning = (result?.reasoning as ReasoningItem[]) ?? []
  const riskFlags = (result?.riskFlags as string[]) ?? []

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-foreground">Match Score</h2>
        <button
          onClick={handleScore}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          {loading ? "Scoring…" : result ? "Re-score" : "Score this job"}
        </button>
      </div>

      {result ? (
        <>
          <ScoreBadge score={result.score} />

          {riskFlags.length > 0 && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20 px-4 py-3">
              <p className="text-xs font-medium text-red-700 dark:text-red-400 mb-1.5">
                Risk Flags
              </p>
              <ul className="space-y-1">
                {riskFlags.map((flag, i) => (
                  <li key={i} className="text-xs text-red-600 dark:text-red-400 flex items-start gap-1.5">
                    <span className="mt-0.5 shrink-0">⚑</span>
                    {flag}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {reasoning.length > 0 && (
            <ul className="mt-4 space-y-2">
              {reasoning.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-xs">
                  <span
                    className={`mt-0.5 w-12 shrink-0 text-right font-medium tabular-nums ${
                      item.delta > 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-500 dark:text-red-400"
                    }`}
                  >
                    {item.delta > 0 ? `+${item.delta}` : item.delta}
                  </span>
                  <span className="text-muted-foreground">
                    <span className="text-foreground font-medium">{item.factor}</span>
                    {" — "}
                    {item.note}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          Run the scorer to see how well this job matches your profile.
        </p>
      )}
    </div>
  )
}
