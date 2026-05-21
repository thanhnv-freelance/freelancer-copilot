import { db } from "@/lib/db"
import { jobs } from "@/lib/db/schema"
import { and, count, desc, eq, ilike, or } from "drizzle-orm"
import type { NewJob } from "@/lib/db/schema"

export type JobFilters = {
  status?: string
  budgetType?: string
  source?: string
  search?: string
}

export async function getJobs(filters?: JobFilters) {
  const conditions = []

  if (filters?.status && filters.status !== "all") {
    conditions.push(eq(jobs.status, filters.status))
  }
  if (filters?.budgetType && filters.budgetType !== "all") {
    conditions.push(eq(jobs.budgetType, filters.budgetType))
  }
  if (filters?.source && filters.source !== "all") {
    conditions.push(eq(jobs.source, filters.source))
  }
  if (filters?.search) {
    conditions.push(
      or(
        ilike(jobs.title, `%${filters.search}%`),
        ilike(jobs.description, `%${filters.search}%`)
      )
    )
  }

  return db
    .select()
    .from(jobs)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(jobs.createdAt))
}

export async function getJobById(id: string) {
  const result = await db
    .select()
    .from(jobs)
    .where(eq(jobs.id, id))
    .limit(1)
  return result[0] ?? null
}

export async function getJobStats() {
  const rows = await db
    .select({ status: jobs.status, count: count() })
    .from(jobs)
    .groupBy(jobs.status)

  const byStatus = Object.fromEntries(rows.map((r) => [r.status, r.count]))

  return {
    total: rows.reduce((sum, r) => sum + r.count, 0),
    new: byStatus["new"] ?? 0,
    bookmarked: byStatus["bookmarked"] ?? 0,
    applied: byStatus["applied"] ?? 0,
    skipped: byStatus["skipped"] ?? 0,
  }
}

export async function createJob(data: NewJob) {
  const result = await db.insert(jobs).values(data).returning()
  return result[0]
}

export async function updateJobStatus(id: string, status: string) {
  await db
    .update(jobs)
    .set({ status, updatedAt: new Date() })
    .where(eq(jobs.id, id))
}

export async function deleteJob(id: string) {
  await db.delete(jobs).where(eq(jobs.id, id))
}
