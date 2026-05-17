"use client"

import { useState } from "react"
import { AssetForm } from "./asset-form"

export function NewAssetButton() {
  const [open, setOpen] = useState(false)

  if (open) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 mb-6">
        <h2 className="text-sm font-medium text-foreground mb-5">
          New Asset
        </h2>
        <AssetForm onClose={() => setOpen(false)} />
      </div>
    )
  }

  return (
    <button
      onClick={() => setOpen(true)}
      className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-80 transition-opacity"
    >
      New Asset
    </button>
  )
}
