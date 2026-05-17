import { db } from "@/lib/db"
import { scoringResults } from "@/lib/db/schema"
import { scoreJob } from "@/lib/scoring/engine"
import { eq, desc } from "drizzle-orm"
import type { Job, ScoringResult } from "@/lib/db/schema"

export async function getScoreForJob(jobId: string): Promise<ScoringResult | null> {
  const rows = await db
    .select()
    .from(scoringResults)
    .where(eq(scoringResults.jobId, jobId))
    .orderBy(desc(scoringResults.createdAt))
    .limit(1)
  return rows[0] ?? null
}

export async function computeAndSaveScore(job: Job): Promise<ScoringResult> {
  const { score, reasoning, riskFlags } = scoreJob(job)
  const [result] = await db
    .insert(scoringResults)
    .values({ jobId: job.id, score, reasoning, riskFlags })
    .returning()
  return result
}
