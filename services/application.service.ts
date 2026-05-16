import { db } from "@/lib/db"
import { applications, jobs } from "@/lib/db/schema"
import { and, desc, eq } from "drizzle-orm"
import type { NewApplication } from "@/lib/db/schema"

export type ApplicationWithJob = {
  id: string
  jobId: string
  jobTitle: string
  proposalText: string | null
  status: string
  hourlyRate: string | null
  projectValue: string | null
  feedback: string | null
  submittedAt: Date | null
  interviewAt: Date | null
  createdAt: Date
  updatedAt: Date
}

const SELECT = {
  id: applications.id,
  jobId: applications.jobId,
  jobTitle: jobs.title,
  proposalText: applications.proposalText,
  status: applications.status,
  hourlyRate: applications.hourlyRate,
  projectValue: applications.projectValue,
  feedback: applications.feedback,
  submittedAt: applications.submittedAt,
  interviewAt: applications.interviewAt,
  createdAt: applications.createdAt,
  updatedAt: applications.updatedAt,
}

export async function getApplications(filters?: {
  status?: string
  jobId?: string
}): Promise<ApplicationWithJob[]> {
  const conditions = []
  if (filters?.status && filters.status !== "all") {
    conditions.push(eq(applications.status, filters.status))
  }
  if (filters?.jobId) {
    conditions.push(eq(applications.jobId, filters.jobId))
  }

  return db
    .select(SELECT)
    .from(applications)
    .innerJoin(jobs, eq(applications.jobId, jobs.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(applications.updatedAt))
}

export async function getApplicationByJobId(
  jobId: string
): Promise<ApplicationWithJob | null> {
  const rows = await db
    .select(SELECT)
    .from(applications)
    .innerJoin(jobs, eq(applications.jobId, jobs.id))
    .where(eq(applications.jobId, jobId))
    .limit(1)
  return rows[0] ?? null
}

export async function getApplicationById(
  id: string
): Promise<ApplicationWithJob | null> {
  const rows = await db
    .select(SELECT)
    .from(applications)
    .innerJoin(jobs, eq(applications.jobId, jobs.id))
    .where(eq(applications.id, id))
    .limit(1)
  return rows[0] ?? null
}

export async function createApplication(data: NewApplication) {
  const [result] = await db.insert(applications).values(data).returning()
  return result
}

export async function updateApplication(
  id: string,
  data: Partial<
    Pick<
      NewApplication,
      | "status"
      | "hourlyRate"
      | "projectValue"
      | "feedback"
      | "proposalText"
      | "submittedAt"
      | "interviewAt"
    >
  >
) {
  const [result] = await db
    .update(applications)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(applications.id, id))
    .returning()
  return result ?? null
}

export async function deleteApplication(id: string) {
  await db.delete(applications).where(eq(applications.id, id))
}

export async function getApplicationStats() {
  const all = await db.select().from(applications)
  const sent = all.filter((a) => a.status !== "draft").length
  const responded = all.filter((a) =>
    ["interviewing", "won", "lost"].includes(a.status)
  ).length
  const won = all.filter((a) => a.status === "won").length
  const closed = all.filter((a) => ["won", "lost"].includes(a.status)).length
  const revenue = all
    .filter((a) => a.status === "won" && a.projectValue)
    .reduce((sum, a) => sum + Number(a.projectValue), 0)

  return {
    sent,
    responseRate: sent > 0 ? Math.round((responded / sent) * 100) : 0,
    winRate: closed > 0 ? Math.round((won / closed) * 100) : 0,
    revenue,
  }
}
