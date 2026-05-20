import { db } from "@/lib/db"
import { profiles } from "@/lib/db/schema"
import type { ExperienceEntry } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { FREELANCER_PROFILE } from "@/lib/scoring/config"
import type { FreelancerProfile, SkillWeight } from "@/lib/scoring/config"

export type { ExperienceEntry }

export type ProfileData = {
  name: string
  title: string
  bio: string
  skills: string[]
  experience: ExperienceEntry[]
  minFixedBudget: number
  minHourlyRate: number
}

// Build a weight for a skill name: use existing config weight if known, else 10
function resolveWeight(name: string): number {
  const lower = name.toLowerCase()
  const found = FREELANCER_PROFILE.skills.find((s) => s.name === lower)
  return found?.weight ?? 10
}

export async function getProfile(): Promise<ProfileData> {
  const rows = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, "default"))
    .limit(1)

  if (!rows[0]) return toProfileData(null)
  return toProfileData(rows[0])
}

function toProfileData(row: typeof profiles.$inferSelect | null): ProfileData {
  if (!row) {
    return {
      name: "",
      title: "",
      bio: "",
      skills: FREELANCER_PROFILE.skills.map((s) => s.name),
      experience: [],
      minFixedBudget: FREELANCER_PROFILE.minFixedBudget,
      minHourlyRate: FREELANCER_PROFILE.minHourlyRate,
    }
  }
  return {
    name: row.name,
    title: row.title,
    bio: row.bio,
    skills: (row.skills as string[]) ?? [],
    experience: (row.experience as ExperienceEntry[]) ?? [],
    minFixedBudget: Number(row.minFixedBudget),
    minHourlyRate: Number(row.minHourlyRate),
  }
}

export async function upsertProfile(data: ProfileData): Promise<ProfileData> {
  const [row] = await db
    .insert(profiles)
    .values({
      id: "default",
      name: data.name,
      title: data.title,
      bio: data.bio,
      skills: data.skills,
      experience: data.experience,
      minFixedBudget: String(data.minFixedBudget),
      minHourlyRate: String(data.minHourlyRate),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: profiles.id,
      set: {
        name: data.name,
        title: data.title,
        bio: data.bio,
        skills: data.skills,
        experience: data.experience,
        minFixedBudget: String(data.minFixedBudget),
        minHourlyRate: String(data.minHourlyRate),
        updatedAt: new Date(),
      },
    })
    .returning()
  return toProfileData(row)
}

// Convert ProfileData → FreelancerProfile for use in scoring engine
export function toFreelancerProfile(data: ProfileData): FreelancerProfile {
  const skills: SkillWeight[] = data.skills.map((name) => ({
    name: name.toLowerCase(),
    weight: resolveWeight(name),
  }))
  return {
    skills,
    minFixedBudget: data.minFixedBudget,
    minHourlyRate: data.minHourlyRate,
  }
}
