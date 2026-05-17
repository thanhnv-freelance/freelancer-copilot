import { getLeads } from "@/services/lead.service"
import { LeadList } from "@/components/leads/lead-list"
import { NewLeadForm } from "@/components/leads/new-lead-form"
import Link from "next/link"

const STATUS_TABS = [
  { label: "All", value: "all" },
  { label: "New", value: "new" },
  { label: "Contacted", value: "contacted" },
  { label: "Meeting", value: "meeting" },
  { label: "Won", value: "won" },
  { label: "Lost", value: "lost" },
]

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status = "all" } = await searchParams
  const allLeads = await getLeads(status !== "all" ? { status } : undefined)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-foreground">
          Leads
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({allLeads.length})
          </span>
        </h1>
        <NewLeadForm />
      </div>

      <div className="flex gap-1 mb-6 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value === "all" ? "/leads" : `/leads?status=${tab.value}`}
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

      <LeadList leads={allLeads} />
    </div>
  )
}
