"use client"

import { useState } from "react"
import type { ProfileData } from "@/services/profile.service"

export function ProfileForm({ initial }: { initial: ProfileData }) {
  const [form, setForm] = useState({
    name: initial.name,
    bio: initial.bio,
    skillsText: initial.skills.join(", "),
    minFixedBudget: String(initial.minFixedBudget),
    minHourlyRate: String(initial.minHourlyRate),
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
      setSaved(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const skills = form.skillsText
      .split(/[,\n]+/)
      .map((s) => s.trim())
      .filter(Boolean)

    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        bio: form.bio,
        skills,
        minFixedBudget: Number(form.minFixedBudget) || 0,
        minHourlyRate: Number(form.minHourlyRate) || 0,
      }),
    })

    if (res.ok) {
      setSaved(true)
    } else {
      setError("Failed to save. Check your input and try again.")
    }
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Your name
        </label>
        <input
          type="text"
          value={form.name}
          onChange={set("name")}
          placeholder="e.g. Alex Chen"
          className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-faint focus:outline-none focus:ring-1 focus:ring-foreground/30"
        />
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Profile bio
          <span className="ml-2 font-normal text-muted-foreground">
            — used in AI proposal generation
          </span>
        </label>
        <textarea
          rows={5}
          value={form.bio}
          onChange={set("bio")}
          placeholder={`- Expertise: Java, Spring Boot, AWS, Payment Systems\n- Experience: 5+ years backend development\n- Approach: clean architecture, API-first design`}
          className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-faint focus:outline-none focus:ring-1 focus:ring-foreground/30 resize-none font-mono"
        />
        <p className="mt-1 text-xs text-faint">
          Write in bullet form. This goes verbatim into the proposal prompt.
        </p>
      </div>

      {/* Skills */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Skills
          <span className="ml-2 font-normal text-muted-foreground">
            — used for job match scoring
          </span>
        </label>
        <textarea
          rows={3}
          value={form.skillsText}
          onChange={set("skillsText")}
          placeholder="Spring Boot, Java, AWS, Kotlin, PostgreSQL, Docker"
          className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-faint focus:outline-none focus:ring-1 focus:ring-foreground/30 resize-none"
        />
        <p className="mt-1 text-xs text-faint">
          Comma or newline separated. Skills listed first receive higher match
          weight.
        </p>
      </div>

      {/* Budget thresholds */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Min fixed budget ($)
          </label>
          <input
            type="number"
            min={0}
            value={form.minFixedBudget}
            onChange={set("minFixedBudget")}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/30"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Min hourly rate ($/hr)
          </label>
          <input
            type="number"
            min={0}
            value={form.minHourlyRate}
            onChange={set("minHourlyRate")}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/30"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save profile"}
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
