import type { Job } from "@/lib/db/schema"

export function formatBudget(
  job: Pick<Job, "budgetType" | "budgetMin" | "budgetMax">
) {
  const suffix = job.budgetType === "hourly" ? "/hr" : ""
  const min = job.budgetMin
    ? `$${Number(job.budgetMin).toLocaleString()}`
    : null
  const max = job.budgetMax
    ? `$${Number(job.budgetMax).toLocaleString()}`
    : null

  if (min && max && min !== max) return `${min}–${max}${suffix}`
  if (min) return `${min}${suffix}`
  if (max) return `${max}${suffix}`
  return "—"
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}
