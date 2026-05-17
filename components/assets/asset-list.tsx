"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Asset } from "@/lib/db/schema"
import { AssetForm } from "./asset-form"

const CATEGORY_COLORS: Record<string, string> = {
  proposal: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  intro: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  architecture: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  checklist: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      onClick={copy}
      className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  )
}

export function AssetList({ assets }: { assets: Asset[] }) {
  const router = useRouter()
  const [editing, setEditing] = useState<Asset | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function deleteAsset(id: string) {
    setLoadingId(id)
    await fetch(`/api/assets/${id}`, { method: "DELETE" })
    setLoadingId(null)
    router.refresh()
  }

  if (editing) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-sm font-medium text-foreground mb-5">
          Edit: {editing.title}
        </h2>
        <AssetForm initial={editing} onClose={() => setEditing(null)} />
      </div>
    )
  }

  if (assets.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground">
        No assets yet. Create your first reusable template.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {assets.map((asset) => {
        const tags = (asset.tags as string[]) ?? []
        const isExpanded = expanded === asset.id
        const isLoading = loadingId === asset.id

        return (
          <div
            key={asset.id}
            className="rounded-xl border border-border bg-card"
          >
            {/* Header row */}
            <div className="flex items-center gap-3 p-4">
              <button
                onClick={() =>
                  setExpanded(isExpanded ? null : asset.id)
                }
                className="flex-1 flex items-center gap-3 text-left min-w-0"
              >
                <span
                  className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[asset.category] ?? ""}`}
                >
                  {asset.category}
                </span>
                <span className="text-sm font-medium text-foreground truncate">
                  {asset.title}
                </span>
                {tags.length > 0 && (
                  <span className="hidden sm:flex gap-1 flex-wrap">
                    {tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full bg-subtle text-xs text-faint"
                      >
                        {tag}
                      </span>
                    ))}
                    {tags.length > 3 && (
                      <span className="px-2 py-0.5 rounded-full bg-subtle text-xs text-faint">
                        +{tags.length - 3}
                      </span>
                    )}
                  </span>
                )}
                <span className="ml-auto shrink-0 text-xs text-faint">
                  {isExpanded ? "▲" : "▼"}
                </span>
              </button>

              <div className="flex items-center gap-2 shrink-0">
                <CopyButton text={asset.body} />
                <button
                  onClick={() => setEditing(asset)}
                  className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteAsset(asset.id)}
                  disabled={isLoading}
                  className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Expanded body */}
            {isExpanded && (
              <div className="px-4 pb-4 border-t border-border pt-3">
                <pre className="text-xs text-foreground whitespace-pre-wrap font-mono leading-relaxed max-h-80 overflow-y-auto">
                  {asset.body}
                </pre>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
