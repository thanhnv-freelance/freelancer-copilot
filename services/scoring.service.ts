import { db } from "@/lib/db"
import { scoringResults } from "@/lib/db/schema"
import { scoreJob } from "@/lib/scoring/engine"
import { eq, desc, inArray } from "drizzle-orm"
import type { Job, ScoringResult } from "@/lib/db/schema"
import { getProfile, toFreelancerProfile } from "@/services/profile.service"

export async function getScoreForJob(jobId: string): Promise<ScoringResult | null> {
  const rows = await db
    .select()
    .from(scoringResults)
    .where(eq(scoringResults.jobId, jobId))
    .orderBy(desc(scoringResults.createdAt))
    .limit(1)
  return rows[0] ?? null
}

export async function getLatestScoresForJobs(
  jobIds: string[]
): Promise<Map<string, number>> {
  if (jobIds.length === 0) return new Map()
  const rows = await db
    .select()
    .from(scoringResults)
    .where(inArray(scoringResults.jobId, jobIds))
    .orderBy(desc(scoringResults.createdAt))
  const map = new Map<string, number>()
  for (const row of rows) {
    if (!map.has(row.jobId)) map.set(row.jobId, row.score)
  }
  return map
}

export async function computeAndSaveScore(job: Job): Promise<ScoringResult> {
  const profileData = await getProfile()
  const profile = toFreelancerProfile(profileData)
  const { score, reasoning, riskFlags } = scoreJob(job, profile)
  const [result] = await db
    .insert(scoringResults)
    .values({ jobId: job.id, score, reasoning, riskFlags })
    .returning()
  return result
}
