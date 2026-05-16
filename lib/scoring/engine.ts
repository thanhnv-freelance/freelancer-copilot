import type { Job } from "@/lib/db/schema"
import { FREELANCER_PROFILE } from "./config"

export interface ReasoningItem {
  factor: string
  delta: number
  note: string
}

export interface ScoreResult {
  score: number
  reasoning: ReasoningItem[]
}

const BASE_SCORE = 40

export function scoreJob(job: Job): ScoreResult {
  const reasoning: ReasoningItem[] = []
  let score = BASE_SCORE

  const text = `${job.title} ${job.description}`.toLowerCase()
  const jobSkills = ((job.skills as string[]) ?? []).map((s) => s.toLowerCase())

  // 1. Skill match — check job skills array and description text
  for (const { name, weight } of FREELANCER_PROFILE.skills) {
    const matched =
      jobSkills.some((s) => s.includes(name)) || text.includes(name)
    if (matched) {
      score += weight
      reasoning.push({
        factor: "Skill Match",
        delta: weight,
        note: `Matched: ${name}`,
      })
    }
  }

  // 2. Budget threshold
  if (job.budgetType === "fixed") {
    const min = job.budgetMin ? Number(job.budgetMin) : null
    const max = job.budgetMax ? Number(job.budgetMax) : null
    const effective = min ?? max
    if (effective !== null) {
      if (effective < FREELANCER_PROFILE.minFixedBudget) {
        const delta = -20
        score += delta
        reasoning.push({
          factor: "Budget",
          delta,
          note: `Fixed budget $${effective} below minimum $${FREELANCER_PROFILE.minFixedBudget}`,
        })
      } else {
        const delta = 10
        score += delta
        reasoning.push({
          factor: "Budget",
          delta,
          note: `Fixed budget $${effective} meets threshold`,
        })
      }
    }
  } else if (job.budgetType === "hourly") {
    const min = job.budgetMin ? Number(job.budgetMin) : null
    if (min !== null) {
      if (min < FREELANCER_PROFILE.minHourlyRate) {
        const delta = -15
        score += delta
        reasoning.push({
          factor: "Budget",
          delta,
          note: `Hourly rate $${min}/hr below minimum $${FREELANCER_PROFILE.minHourlyRate}/hr`,
        })
      } else {
        const delta = 10
        score += delta
        reasoning.push({
          factor: "Budget",
          delta,
          note: `Hourly rate $${min}/hr meets threshold`,
        })
      }
    }
  }

  // 3. Proposal competition
  if (job.proposalCount !== null && job.proposalCount !== undefined) {
    if (job.proposalCount <= 5) {
      const delta = 15
      score += delta
      reasoning.push({
        factor: "Competition",
        delta,
        note: `Low competition: only ${job.proposalCount} proposals`,
      })
    } else if (job.proposalCount > 20) {
      const delta = -10
      score += delta
      reasoning.push({
        factor: "Competition",
        delta,
        note: `High competition: ${job.proposalCount} proposals`,
      })
    }
  }

  // 4. Payment verification
  if (job.paymentVerified) {
    const delta = 10
    score += delta
    reasoning.push({
      factor: "Payment Verified",
      delta,
      note: "Client payment method verified",
    })
  } else {
    const delta = -5
    score += delta
    reasoning.push({
      factor: "Payment Verified",
      delta,
      note: "Client payment not verified",
    })
  }

  // 5. Client rating
  if (job.clientRating) {
    const rating = Number(job.clientRating)
    if (rating >= 4.5) {
      const delta = 10
      score += delta
      reasoning.push({
        factor: "Client Rating",
        delta,
        note: `Excellent client rating: ${rating}/5`,
      })
    } else if (rating < 3.5) {
      const delta = -10
      score += delta
      reasoning.push({
        factor: "Client Rating",
        delta,
        note: `Poor client rating: ${rating}/5`,
      })
    }
  }

  // 6. Client hire rate
  if (job.clientHireRate) {
    const hireRate = Number(job.clientHireRate)
    if (hireRate >= 70) {
      const delta = 5
      score += delta
      reasoning.push({
        factor: "Hire Rate",
        delta,
        note: `High hire rate: ${hireRate}%`,
      })
    } else if (hireRate < 30) {
      const delta = -5
      score += delta
      reasoning.push({
        factor: "Hire Rate",
        delta,
        note: `Low hire rate: ${hireRate}%`,
      })
    }
  }

  return { score: Math.max(0, Math.min(100, score)), reasoning }
}
