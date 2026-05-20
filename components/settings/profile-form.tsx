"use client"

import { useState } from "react"
import type { ProfileData, ExperienceEntry } from "@/services/profile.service"

// ─── Markdown parser ──────────────────────────────────────────────────────────

function parseMarkdownProfile(md: string): Partial<ProfileData> {
  // Split into sections by ## headings
  const sectionMap: Record<string, string> = {}
  const parts = md.split(/^## /m)
  for (const part of parts) {
    const newline = part.indexOf("\n")
    if (newline === -1) continue
    const heading = part.slice(0, newline).trim().toLowerCase()
    sectionMap[heading] = part.slice(newline + 1).trim()
  }

  // Name
  const name = sectionMap["name"]?.split("\n")[0]?.trim() ?? ""

  // Title
  const title = sectionMap["title"]?.split("\n")[0]?.trim() ?? ""

  // Bio — prefer code block under "suggested profile bio", fall back to "bio"
  let bio = ""
  const bioRaw =
    sectionMap["suggested profile bio (for settings → profile)"] ??
    sectionMap["bio"] ??
    ""
  const codeBlock = bioRaw.match(/```[^\n]*\n([\s\S]*?)```/)
  bio = codeBlock ? codeBlock[1].trim() : bioRaw.trim()

  // Skills — flatten all bullet lines under ## Skills subsections
  const skillsRaw = sectionMap["skills"] ?? ""
  const skills = skillsRaw
    .split("\n")
    .filter((l) => l.trim().startsWith("- "))
    .map((l) => l.replace(/^[\s-]+/, "").trim())
    .filter(Boolean)

  // Experience — parse markdown table rows
  const expRaw = sectionMap["experience"] ?? ""
  const tableLines = expRaw
    .split("\n")
    .filter((l) => l.startsWith("|") && !l.match(/^\|[-| ]+\|$/))
  const experience: ExperienceEntry[] = []
  for (let i = 1; i < tableLines.length; i++) {
    const cells = tableLines[i]
      .split("|")
      .map((c) => c.trim())
      .filter(Boolean)
    if (cells.length >= 4) {
      experience.push({
        period: cells[0],
        company: cells[1],
        location: cells[2],
        focus: cells[3],
      })
    }
  }

  // Budget thresholds
  const budgetRaw = sectionMap["budget thresholds"] ?? ""
  const fixedMatch = budgetRaw.match(/min fixed budget[^$\d]*\$?(\d+)/)
  const hourlyMatch = budgetRaw.match(/min hourly rate[^$\d]*\$?(\d+)/)
  const minFixedBudget = fixedMatch ? Number(fixedMatch[1]) : undefined
  const minHourlyRate = hourlyMatch ? Number(hourlyMatch[1]) : undefined

  return { name, title, bio, skills, experience, minFixedBudget, minHourlyRate }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProfileForm({ initial }: { initial: ProfileData }) {
  const [form, setForm] = useState({
    name: initial.name,
    title: initial.title,
    bio: initial.bio,
    skillsText: initial.skills.join(", "),
    experience: initial.experience as ExperienceEntry[],
    minFixedBudget: String(initial.minFixedBudget),
    minHourlyRate: String(initial.minHourlyRate),
  })
  const [importOpen, setImportOpen] = useState(false)
  const [importText, setImportText] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
      setSaved(false)
    }
  }

  function applyImport() {
    const parsed = parseMarkdownProfile(importText)
    setForm((prev) => ({
      name: parsed.name || prev.name,
      title: parsed.title || prev.title,
      bio: parsed.bio || prev.bio,
      skillsText: parsed.skills?.length ? parsed.skills.join(", ") : prev.skillsText,
      experience: parsed.experience?.length ? parsed.experience : prev.experience,
      minFixedBudget: parsed.minFixedBudget ? String(parsed.minFixedBudget) : prev.minFixedBudget,
      minHourlyRate: parsed.minHourlyRate ? String(parsed.minHourlyRate) : prev.minHourlyRate,
    }))
    setImportOpen(false)
    setImportText("")
    setSaved(false)
  }

  function removeExperience(index: number) {
    setForm((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }))
    setSaved(false)
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
        title: form.title,
        bio: form.bio,
        skills,
        experience: form.experience,
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
      {/* Import from Markdown */}
      <div className="rounded-lg border border-border bg-card">
        <button
          type="button"
          onClick={() => setImportOpen((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/40 transition-colors rounded-lg"
        >
          <span>Import from Markdown</span>
          <span className="text-muted-foreground text-xs">
            {importOpen ? "▲ close" : "▼ paste docs/profile.md"}
          </span>
        </button>
        {importOpen && (
          <div className="border-t border-border px-4 pb-4 pt-3 space-y-3">
            <textarea
              rows={10}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Paste the contents of docs/profile.md here…"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-faint focus:outline-none focus:ring-1 focus:ring-foreground/30 resize-y font-mono"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={applyImport}
                disabled={!importText.trim()}
                className="px-3 py-1.5 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-40"
              >
                Apply
              </button>
              <button
                type="button"
                onClick={() => { setImportOpen(false); setImportText("") }}
                className="px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Your name
        </label>
        <input
          type="text"
          value={form.name}
          onChange={set("name")}
          placeholder="e.g. Nguyen Van Thanh"
          className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-faint focus:outline-none focus:ring-1 focus:ring-foreground/30"
        />
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Professional title
        </label>
        <input
          type="text"
          value={form.title}
          onChange={set("title")}
          placeholder="e.g. Senior Backend & Cloud Engineer"
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
          placeholder={`- 10+ years building large-scale distributed systems for banking and fintech\n- Specialties: Spring Boot microservices, AWS, payment/remittance platforms\n- Stack: Java, Spring Boot, WebFlux, AWS, PostgreSQL, Docker, Kubernetes`}
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
          placeholder="Java, Spring Boot, WebFlux, AWS, PostgreSQL, Docker, Kubernetes"
          className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-faint focus:outline-none focus:ring-1 focus:ring-foreground/30 resize-none"
        />
        <p className="mt-1 text-xs text-faint">
          Comma or newline separated. Skills listed first receive higher match weight.
        </p>
      </div>

      {/* Experience */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Experience
          <span className="ml-2 font-normal text-muted-foreground">
            — used in AI proposal generation
          </span>
        </label>
        {form.experience.length === 0 ? (
          <p className="text-sm text-faint py-3 px-3 rounded-lg border border-dashed border-border">
            No experience entries. Import from Markdown to populate.
          </p>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="text-left px-3 py-2 font-medium text-muted-foreground">Period</th>
                  <th className="text-left px-3 py-2 font-medium text-muted-foreground">Company</th>
                  <th className="text-left px-3 py-2 font-medium text-muted-foreground hidden sm:table-cell">Location</th>
                  <th className="text-left px-3 py-2 font-medium text-muted-foreground hidden md:table-cell">Focus</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {form.experience.map((entry, i) => (
                  <tr key={i} className="hover:bg-muted/20">
                    <td className="px-3 py-2 text-foreground whitespace-nowrap">{entry.period}</td>
                    <td className="px-3 py-2 text-foreground">{entry.company}</td>
                    <td className="px-3 py-2 text-muted-foreground hidden sm:table-cell">{entry.location}</td>
                    <td className="px-3 py-2 text-muted-foreground hidden md:table-cell">{entry.focus}</td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => removeExperience(i)}
                        className="text-xs text-red-500 hover:text-red-700 transition-colors"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
          <span className="text-sm text-green-600 dark:text-green-400">Saved</span>
        )}
        {error && <span className="text-sm text-red-500">{error}</span>}
      </div>
    </form>
  )
}
