import { db } from "@/lib/db"
import { leads } from "@/lib/db/schema"
import { and, desc, eq } from "drizzle-orm"
import type { NewLead } from "@/lib/db/schema"

export async function getLeads(filters?: { status?: string; source?: string }) {
  const conditions = []
  if (filters?.status && filters.status !== "all") {
    conditions.push(eq(leads.status, filters.status))
  }
  if (filters?.source && filters.source !== "all") {
    conditions.push(eq(leads.source, filters.source))
  }
  return db
    .select()
    .from(leads)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(leads.createdAt))
}

export async function getLeadById(id: string) {
  const rows = await db.select().from(leads).where(eq(leads.id, id)).limit(1)
  return rows[0] ?? null
}

export async function createLead(data: NewLead) {
  const [result] = await db.insert(leads).values(data).returning()
  return result
}

export async function updateLead(
  id: string,
  data: Partial<Pick<NewLead, "name" | "company" | "source" | "notes" | "status" | "value">>
) {
  const [result] = await db
    .update(leads)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(leads.id, id))
    .returning()
  return result ?? null
}

export async function deleteLead(id: string) {
  await db.delete(leads).where(eq(leads.id, id))
}
