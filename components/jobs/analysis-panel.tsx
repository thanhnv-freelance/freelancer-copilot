"use client"

import { useCompletion } from "@ai-sdk/react"

export function AnalysisPanel({ jobId }: { jobId: string }) {
  const { completion, complete, isLoading, error } = useCompletion({
    api: `/api/jobs/${jobId}/analyze`,
  })

  // Render markdown-like section headers (## Heading) as styled text
  function renderContent(text: string) {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("## ")) {
        return (
          <p key={i} className="text-sm font-semibold text-foreground mt-4 first:mt-0">
            {line.slice(3)}
          </p>
        )
      }
      if (line.startsWith("- ")) {
        return (
          <p key={i} className="text-sm text-foreground pl-3 before:content-['•'] before:mr-2 before:text-muted-foreground">
            {line.slice(2)}
          </p>
        )
      }
      if (line.trim() === "") return <div key={i} className="h-1" />
      return (
        <p key={i} className="text-sm text-foreground">
          {line}
        </p>
      )
    })
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-foreground">Job Analysis</h2>
        <button
          onClick={() => complete("")}
          disabled={isLoading}
          className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          {isLoading ? "Analyzing…" : completion ? "Re-analyze" : "Analyze Job"}
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-500 mb-3">{error.message}</p>
      )}

      {completion ? (
        <div className="space-y-1">{renderContent(completion)}</div>
      ) : !isLoading ? (
        <p className="text-sm text-muted-foreground">
          Get an AI breakdown of requirements, red flags, and what to highlight in your proposal.
        </p>
      ) : null}

      {isLoading && !completion && (
        <p className="text-xs text-muted-foreground animate-pulse">Analyzing job description…</p>
      )}
    </div>
  )
}
