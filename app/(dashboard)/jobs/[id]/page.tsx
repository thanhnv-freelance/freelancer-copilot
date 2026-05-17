import { getJobById } from "@/services/job.service"
import { getScoreForJob } from "@/services/scoring.service"
import { getApplicationByJobId } from "@/services/application.service"
import { StatusActions } from "@/components/jobs/status-actions"
import { ScorePanel } from "@/components/jobs/score-panel"
import { AnalysisPanel } from "@/components/jobs/analysis-panel"
import { ProposalPanel } from "@/components/jobs/proposal-panel"
import { ApplicationPanel } from "@/components/jobs/application-panel"
import { formatBudget, formatDate } from "@/lib/utils/format"
import { getPlatformLabel } from "@/lib/constants/platforms"
import { notFound } from "next/navigation"
import Link from "next/link"

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground mb-0.5">{label}</dt>
      <dd className="text-sm text-foreground">{value}</dd>
    </div>
  )
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [job, existingScore, existingApplication] = await Promise.all([
    getJobById(id),
    getScoreForJob(id),
    getApplicationByJobId(id),
  ])
  if (!job) notFound()

  const skills = (job.skills as string[]) ?? []

  return (
    <div className="p-6 max-w-3xl">
      <Link
        href="/jobs"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 inline-block"
      >
        &larr; Jobs
      </Link>

      <div className="flex items-start justify-between gap-4 mb-4">
        <h1 className="text-xl font-semibold text-foreground">{job.title}</h1>
        <StatusActions jobId={job.id} currentStatus={job.status} />
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-5">
        <span className="font-medium text-foreground">{formatBudget(job)}</span>
        {job.proposalCount !== null && (
          <span>{job.proposalCount} proposals</span>
        )}
        {job.paymentVerified && (
          <span className="text-green-600 dark:text-green-400">
            Payment Verified
          </span>
        )}
        <span>{formatDate(job.createdAt)}</span>
        {job.url && (
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground underline"
          >
            View on {getPlatformLabel(job.source)}
          </a>
        )}
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-6">
          {skills.map((skill) => (
            <span
              key={skill}
              className="px-2.5 py-1 rounded-full bg-subtle text-xs text-muted-foreground"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* Description */}
      <div className="rounded-xl border border-border bg-card p-5 mb-4">
        <h2 className="text-sm font-medium text-foreground mb-3">
          Description
        </h2>
        <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">
          {job.description}
        </pre>
      </div>

      {/* Score */}
      <div className="mb-4">
        <ScorePanel jobId={job.id} initial={existingScore} />
      </div>

      {/* AI panels */}
      <div className="space-y-4 mb-4">
        <AnalysisPanel jobId={job.id} />
        <ProposalPanel jobId={job.id} appId={existingApplication?.id} />
        <ApplicationPanel jobId={job.id} initial={existingApplication} />
      </div>

      {/* Client info */}
      {job.clientName && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-medium text-foreground mb-4">Client</h2>
          <dl className="grid grid-cols-2 gap-4">
            <Stat label="Name" value={job.clientName} />
            {job.clientRating && (
              <Stat label="Rating" value={`${job.clientRating} / 5`} />
            )}
            {job.clientHireRate && (
              <Stat label="Hire Rate" value={`${job.clientHireRate}%`} />
            )}
            {job.clientTotalSpent && (
              <Stat
                label="Total Spent"
                value={`$${Number(job.clientTotalSpent).toLocaleString()}`}
              />
            )}
          </dl>
        </div>
      )}
    </div>
  )
}
