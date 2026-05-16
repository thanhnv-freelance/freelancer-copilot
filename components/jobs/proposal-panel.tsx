"use client"

import { useCompletion } from "@ai-sdk/react"

export function ProposalPanel({ jobId }: { jobId: string }) {
  const { completion, complete, isLoading, error } = useCompletion({
    api: `/api/jobs/${jobId}/proposal`,
  })

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-foreground">AI Proposal Draft</h2>
        <button
          onClick={() => complete("")}
          disabled={isLoading}
          className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          {isLoading ? "Writing…" : completion ? "Regenerate" : "Generate Proposal"}
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-500 mb-3">{error.message}</p>
      )}

      {completion ? (
        <div className="space-y-3">
          <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">
            {completion}
          </pre>
          <button
            onClick={() => navigator.clipboard.writeText(completion)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Copy to clipboard
          </button>
        </div>
      ) : !isLoading ? (
        <p className="text-sm text-muted-foreground">
          Generate an AI-drafted proposal tailored to this job.
        </p>
      ) : null}

      {isLoading && !completion && (
        <div className="flex gap-1 items-center text-xs text-muted-foreground">
          <span className="animate-pulse">Generating proposal…</span>
        </div>
      )}
    </div>
  )
}
