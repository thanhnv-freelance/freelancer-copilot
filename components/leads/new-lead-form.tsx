"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const SOURCE_OPTIONS = [
  { value: "linkedin_dm", label: "LinkedIn DM" },
  { value: "referral", label: "Referral" },
  { value: "direct", label: "Direct contact" },
  { value: "other", label: "Other" },
]

export function NewLeadForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: "",
    company: "",
    source: "linkedin_dm",
    notes: "",
    value: "",
  })

  function set(field: keyof typeof form) {
    return (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        company: form.company || null,
        source: form.source,
        notes: form.notes || null,
        value: form.value || null,
        status: "new",
      }),
    })
    setSaving(false)
    setOpen(false)
    setForm({ name: "", company: "", source: "linkedin_dm", notes: "", value: "" })
    router.refresh()
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-80 transition-opacity"
      >
        Add Lead
      </button>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 mb-6">
      <h2 className="text-sm font-medium text-foreground mb-4">New Lead</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">
              Name *
            </label>
            <input
              required
              value={form.name}
              onChange={set("name")}
              placeholder="Alex Johnson"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-faint focus:outline-none focus:ring-1 focus:ring-foreground/30"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">
              Company
            </label>
            <input
              value={form.company}
              onChange={set("company")}
              placeholder="Acme Corp"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-faint focus:outline-none focus:ring-1 focus:ring-foreground/30"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">
              Source
            </label>
            <select
              value={form.source}
              onChange={set("source")}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/30"
            >
              {SOURCE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">
              Estimated value ($)
            </label>
            <input
              type="number"
              min={0}
              value={form.value}
              onChange={set("value")}
              placeholder="e.g. 5000"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-faint focus:outline-none focus:ring-1 focus:ring-foreground/30"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-muted-foreground mb-1">
            Notes
          </label>
          <textarea
            rows={2}
            value={form.notes}
            onChange={set("notes")}
            placeholder="Context, intro, what they need…"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-faint focus:outline-none focus:ring-1 focus:ring-foreground/30 resize-none"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-50"
          >
            {saving ? "Saving…" : "Add lead"}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
