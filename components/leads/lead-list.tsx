"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Lead } from "@/lib/db/schema"
import { formatDate } from "@/lib/utils/format"

const SOURCE_LABELS: Record<string, string> = {
  linkedin_dm: "LinkedIn DM",
  referral: "Referral",
  direct: "Direct",
  other: "Other",
}

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  contacted: "bg-subtle text-muted-foreground",
  meeting: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  won: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  lost: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
}

const NEXT_STATUS: Record<string, { label: string; value: string }[]> = {
  new: [{ label: "Contacted", value: "contacted" }],
  contacted: [
    { label: "Meeting", value: "meeting" },
    { label: "Lost", value: "lost" },
  ],
  meeting: [
    { label: "Won", value: "won" },
    { label: "Lost", value: "lost" },
  ],
  won: [],
  lost: [],
}

export function LeadList({ leads }: { leads: Lead[] }) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function updateStatus(id: string, status: string) {
    setLoadingId(id)
    await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    setLoadingId(null)
    router.refresh()
  }

  async function deleteLead(id: string) {
    setLoadingId(id)
    await fetch(`/api/leads/${id}`, { method: "DELETE" })
    setLoadingId(null)
    router.refresh()
  }

  if (leads.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground">
        No leads yet. Add your first inbound lead above.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {leads.map((lead) => {
        const isLoading = loadingId === lead.id
        const nextStatuses = NEXT_STATUS[lead.status] ?? []

        return (
          <div
            key={lead.id}
            className="rounded-xl border border-border bg-card p-4 flex flex-col sm:flex-row sm:items-center gap-3"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{lead.name}</p>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[lead.status] ?? ""}`}
                >
                  {lead.status}
                </span>
                <span className="text-xs text-muted-foreground">
                  {SOURCE_LABELS[lead.source] ?? lead.source}
                </span>
                {lead.company && (
                  <span className="text-xs text-muted-foreground">
                    {lead.company}
                  </span>
                )}
                {lead.value && (
                  <span className="text-xs text-muted-foreground">
                    ${Number(lead.value).toLocaleString()}
                  </span>
                )}
                <span className="text-xs text-faint">
                  {formatDate(lead.createdAt)}
                </span>
              </div>
              {lead.notes && (
                <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                  {lead.notes}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap shrink-0">
              {nextStatuses.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => updateStatus(lead.id, value)}
                  disabled={isLoading}
                  className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                >
                  {label}
                </button>
              ))}
              <button
                onClick={() => deleteLead(lead.id)}
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
