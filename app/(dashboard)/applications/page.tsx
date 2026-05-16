import { getApplications } from "@/services/application.service"
import { ApplicationList } from "@/components/applications/application-list"
import Link from "next/link"

const TABS = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Submitted", value: "submitted" },
  { label: "Interviewing", value: "interviewing" },
  { label: "Won", value: "won" },
  { label: "Lost", value: "lost" },
]

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status = "all" } = await searchParams
  const applications = await getApplications(
    status !== "all" ? { status } : undefined
  )

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-foreground mb-6">
        Applications
      </h1>

      <div className="flex gap-1 mb-6 flex-wrap">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={
              tab.value === "all"
                ? "/applications"
                : `/applications?status=${tab.value}`
            }
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              status === tab.value
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <ApplicationList applications={applications} />
    </div>
  )
}
