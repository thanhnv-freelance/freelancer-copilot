import { getApplicationById } from "@/services/application.service"
import { ApplicationEditForm } from "@/components/applications/application-edit-form"
import { notFound } from "next/navigation"
import Link from "next/link"
import { formatDate } from "@/lib/utils/format"

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const app = await getApplicationById(id)
  if (!app) notFound()

  return (
    <div className="p-6 max-w-2xl">
      <Link
        href="/applications"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 inline-block"
      >
        &larr; Applications
      </Link>

      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground mb-1">
          {app.jobTitle}
        </h1>
        <div className="flex gap-3 text-xs text-muted-foreground">
          <Link
            href={`/jobs/${app.jobId}`}
            className="hover:text-foreground underline"
          >
            View job
          </Link>
          <span>Created {formatDate(app.createdAt)}</span>
          {app.submittedAt && (
            <span>Submitted {formatDate(app.submittedAt)}</span>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <ApplicationEditForm app={app} />
      </div>
    </div>
  )
}
