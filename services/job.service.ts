import { db } from "@/lib/db"
import { jobs } from "@/lib/db/schema"
import { and, desc, eq, ilike, or } from "drizzle-orm"
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
  const all = await db.select().from(jobs)
  return {
    total: all.length,
    new: all.filter((j) => j.status === "new").length,
    bookmarked: all.filter((j) => j.status === "bookmarked").length,
    applied: all.filter((j) => j.status === "applied").length,
    skipped: all.filter((j) => j.status === "skipped").length,
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
