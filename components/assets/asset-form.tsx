"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ASSET_CATEGORIES } from "@/lib/constants/assets"
import type { Asset } from "@/lib/db/schema"

const inputClass =
  "w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground outline-none focus:border-foreground focus:ring-1 focus:ring-foreground"

export function AssetForm({
  initial,
  onClose,
}: {
  initial?: Asset
  onClose: () => void
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState(initial?.title ?? "")
  const [body, setBody] = useState(initial?.body ?? "")
  const [category, setCategory] = useState(initial?.category ?? "proposal")
  const [tagsRaw, setTagsRaw] = useState(
    ((initial?.tags as string[]) ?? []).join(", ")
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const tags = tagsRaw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)

    const payload = { title, body, category, tags }

    if (initial) {
      await fetch(`/api/assets/${initial.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    } else {
      await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    }

    setLoading(false)
    router.refresh()
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-muted-foreground">
          Title *
        </label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
          placeholder="e.g. Java Backend Intro Message"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputClass}
          >
            {ASSET_CATEGORIES.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={tagsRaw}
            onChange={(e) => setTagsRaw(e.target.value)}
            className={inputClass}
            placeholder="spring-boot, aws, payments"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-muted-foreground">
          Content *
        </label>
        <textarea
          required
          rows={12}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className={`${inputClass} font-mono text-xs leading-relaxed`}
          placeholder="Write your reusable content here…"
        />
      </div>

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-foreground px-5 py-2 text-sm font-medium text-background hover:opacity-80 transition-opacity disabled:opacity-50"
        >
          {loading ? "Saving…" : initial ? "Save Changes" : "Create Asset"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-border px-5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
