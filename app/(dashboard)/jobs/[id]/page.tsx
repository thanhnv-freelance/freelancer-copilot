import React from "react"
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

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground mb-0.5">{label}</dt>
      <dd className="text-sm font-medium text-foreground">{value}</dd>
    </div>
  )
}

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating)
  const half = rating - full >= 0.5
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} className={`w-3.5 h-3.5 ${i < full ? "text-yellow-400" : i === full && half ? "text-yellow-300" : "text-border"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  )
}

function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "success" }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium
      ${variant === "success" ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400" : "bg-subtle text-muted-foreground"}`}>
      {children}
    </span>
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
        {job.paymentVerified && (
          <span className="text-green-600 dark:text-green-400">
            Payment verified
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

      {/* Activity on this Job */}
      {(job.proposalCount != null || job.lastViewedByClient || job.hires != null || job.interviewing != null || job.invitesSent != null) && (
        <div className="rounded-xl border border-border bg-card p-5 mb-4">
          <h2 className="text-sm font-medium text-foreground mb-4">Activity on this Job</h2>
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
            {job.proposalCount != null && (
              <Stat label="Proposals" value={job.proposalCount} />
            )}
            {job.lastViewedByClient && (
              <Stat label="Last viewed by client" value={job.lastViewedByClient} />
            )}
            {job.hires != null && (
              <Stat label="Hires" value={job.hires} />
            )}
            {job.interviewing != null && (
              <Stat label="Interviewing" value={job.interviewing} />
            )}
            {job.invitesSent != null && (
              <Stat label="Invites sent" value={job.invitesSent} />
            )}
          </dl>
        </div>
      )}

      {/* About the Client */}
      {(job.clientRating || job.clientLocation || job.clientTotalSpent || job.clientJobsPosted || job.paymentVerified) && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-medium text-foreground mb-4">About the Client</h2>

          {/* Verification badges */}
          {job.paymentVerified && (
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="success">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Payment verified
              </Badge>
            </div>
          )}

          {/* Rating row */}
          {job.clientRating && (
            <div className="flex items-center gap-2 mb-4">
              <StarRating rating={Number(job.clientRating)} />
              <span className="text-sm font-medium text-foreground">{Number(job.clientRating).toFixed(2)}</span>
              <span className="text-xs text-muted-foreground">/ 5</span>
            </div>
          )}

          {/* Stats grid */}
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
            {job.clientLocation && (
              <Stat label="Location" value={job.clientLocation} />
            )}
            {job.clientJobsPosted !== null && (
              <Stat label="Jobs posted" value={job.clientJobsPosted!} />
            )}
            {job.clientHireRate && (
              <Stat label="Hire rate" value={`${job.clientHireRate}%`} />
            )}
            {job.clientTotalSpent && (
              <Stat label="Total spent" value={`$${Number(job.clientTotalSpent).toLocaleString()}`} />
            )}
            {job.clientAvgHourlyRate && (
              <Stat label="Avg hourly rate paid" value={`$${job.clientAvgHourlyRate}/hr`} />
            )}
            {job.clientHours != null && (
              <Stat label="Hours" value={`${job.clientHours.toLocaleString()} hrs`} />
            )}
            {job.clientIndustry && (
              <Stat label="Industry" value={job.clientIndustry} />
            )}
            {job.clientMemberSince && (
              <Stat label="Member since" value={job.clientMemberSince} />
            )}
          </dl>
        </div>
      )}
    </div>
  )
}
