"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { ApplicationWithJob } from "@/services/application.service"

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "submitted", label: "Submitted" },
  { value: "interviewing", label: "Interviewing" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
]

export function ApplicationEditForm({ app }: { app: ApplicationWithJob }) {
  const router = useRouter()
  const [form, setForm] = useState({
    status: app.status,
    proposalText: app.proposalText ?? "",
    hourlyRate: app.hourlyRate ?? "",
    projectValue: app.projectValue ?? "",
    feedback: app.feedback ?? "",
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set(field: keyof typeof form) {
    return (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
      setSaved(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const res = await fetch(`/api/applications/${app.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: form.status,
        proposalText: form.proposalText || null,
        hourlyRate: form.hourlyRate || null,
        projectValue: form.projectValue || null,
        feedback: form.feedback || null,
      }),
    })

    if (res.ok) {
      setSaved(true)
      router.refresh()
    } else {
      setError("Failed to save changes.")
    }
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Status
        </label>
        <select
          value={form.status}
          onChange={set("status")}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/30"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Rates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Project value ($)
          </label>
          <input
            type="number"
            min={0}
            value={form.projectValue}
            onChange={set("projectValue")}
            placeholder="e.g. 2500"
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-faint focus:outline-none focus:ring-1 focus:ring-foreground/30"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Hourly rate ($/hr)
          </label>
          <input
            type="number"
            min={0}
            value={form.hourlyRate}
            onChange={set("hourlyRate")}
            placeholder="e.g. 75"
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-faint focus:outline-none focus:ring-1 focus:ring-foreground/30"
          />
        </div>
      </div>

      {/* Proposal text */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Proposal text
        </label>
        <textarea
          rows={10}
          value={form.proposalText}
          onChange={set("proposalText")}
          placeholder="Paste or edit your proposal here…"
          className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-faint focus:outline-none focus:ring-1 focus:ring-foreground/30 resize-none font-mono"
        />
        {form.proposalText && (
          <p className="mt-1 text-xs text-faint tabular-nums">
            {form.proposalText.trim().split(/\s+/).filter(Boolean).length} words
            {" · "}
            {form.proposalText.length} chars
          </p>
        )}
      </div>

      {/* Feedback / notes */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Feedback / notes
        </label>
        <textarea
          rows={3}
          value={form.feedback}
          onChange={set("feedback")}
          placeholder="Client feedback, outcome notes, lessons learned…"
          className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-faint focus:outline-none focus:ring-1 focus:ring-foreground/30 resize-none"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        {saved && (
          <span className="text-sm text-green-600 dark:text-green-400">
            Saved
          </span>
        )}
        {error && <span className="text-sm text-red-500">{error}</span>}
      </div>
    </form>
  )
}
