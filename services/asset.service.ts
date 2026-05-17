import { db } from "@/lib/db"
import { assets } from "@/lib/db/schema"
import { and, desc, eq, ilike, or } from "drizzle-orm"
import type { NewAsset } from "@/lib/db/schema"
export { ASSET_CATEGORIES } from "@/lib/constants/assets"
export type { AssetCategory } from "@/lib/constants/assets"

export async function getAssets(filters?: {
  category?: string
  search?: string
}) {
  const conditions = []
  if (filters?.category && filters.category !== "all") {
    conditions.push(eq(assets.category, filters.category))
  }
  if (filters?.search) {
    conditions.push(
      or(
        ilike(assets.title, `%${filters.search}%`),
        ilike(assets.body, `%${filters.search}%`)
      )
    )
  }

  return db
    .select()
    .from(assets)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(assets.updatedAt))
}

export async function getAssetById(id: string) {
  const rows = await db.select().from(assets).where(eq(assets.id, id)).limit(1)
  return rows[0] ?? null
}

export async function createAsset(data: NewAsset) {
  const [result] = await db.insert(assets).values(data).returning()
  return result
}

export async function updateAsset(
  id: string,
  data: Partial<Pick<NewAsset, "title" | "body" | "category" | "tags">>
) {
  const [result] = await db
    .update(assets)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(assets.id, id))
    .returning()
  return result ?? null
}

export async function deleteAsset(id: string) {
  await db.delete(assets).where(eq(assets.id, id))
}
