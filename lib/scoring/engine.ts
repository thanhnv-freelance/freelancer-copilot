import type { Job } from "@/lib/db/schema"
import { FREELANCER_PROFILE, SCORING_THRESHOLDS } from "./config"
import type { FreelancerProfile } from "./config"

export interface ReasoningItem {
  factor: string
  delta: number
  note: string
}

export interface ScoreResult {
  score: number
  reasoning: ReasoningItem[]
  riskFlags: string[]
}

const BASE_SCORE = 40

const VAGUE_SIGNALS = [
  "should be easy",
  "should be simple",
  "very simple",
  "easy task",
  "quick task",
  "simple task",
  "fast task",
  "nothing complicated",
  "won't take long",
  "simple fix",
  "quick fix",
  "easy fix",
  "nothing fancy",
  "straightforward task",
]

export function scoreJob(job: Job, profile?: FreelancerProfile): ScoreResult {
  const p = profile ?? FREELANCER_PROFILE
  const reasoning: ReasoningItem[] = []
  const riskFlags: string[] = []
  let score = BASE_SCORE

  const text = `${job.title} ${job.description}`.toLowerCase()
  const jobSkills = ((job.skills as string[]) ?? []).map((s) => s.toLowerCase())

  // 1. Skill match — check job skills array and description text
  for (const { name, weight } of p.skills) {
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
      if (effective < p.minFixedBudget) {
        const delta = -20
        score += delta
        reasoning.push({
          factor: "Budget",
          delta,
          note: `Fixed budget $${effective} below minimum $${p.minFixedBudget}`,
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
      if (min < p.minHourlyRate) {
        const delta = -15
        score += delta
        reasoning.push({
          factor: "Budget",
          delta,
          note: `Hourly rate $${min}/hr below minimum $${p.minHourlyRate}/hr`,
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
    if (job.proposalCount <= SCORING_THRESHOLDS.lowCompetitionMax) {
      const delta = 15
      score += delta
      reasoning.push({
        factor: "Competition",
        delta,
        note: `Low competition: only ${job.proposalCount} proposals`,
      })
    } else if (job.proposalCount > SCORING_THRESHOLDS.highCompetitionMin) {
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
    if (rating >= SCORING_THRESHOLDS.ratingExcellentMin) {
      const delta = 10
      score += delta
      reasoning.push({
        factor: "Client Rating",
        delta,
        note: `Excellent client rating: ${rating}/5`,
      })
    } else if (rating < SCORING_THRESHOLDS.ratingPoorMax) {
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
    if (hireRate >= SCORING_THRESHOLDS.hireRateHighMin) {
      const delta = 5
      score += delta
      reasoning.push({
        factor: "Hire Rate",
        delta,
        note: `High hire rate: ${hireRate}%`,
      })
    } else if (hireRate < SCORING_THRESHOLDS.hireRateLowMax) {
      const delta = -5
      score += delta
      reasoning.push({
        factor: "Hire Rate",
        delta,
        note: `Low hire rate: ${hireRate}%`,
      })
    }
  }

  // 7. Client total spent
  if (job.clientTotalSpent !== null && job.clientTotalSpent !== undefined) {
    const spent = Number(job.clientTotalSpent)
    if (spent >= SCORING_THRESHOLDS.spendProvenMin) {
      const delta = 10
      score += delta
      reasoning.push({
        factor: "Client Spend",
        delta,
        note: `$${spent.toLocaleString()} total spent — proven client`,
      })
    } else if (spent >= SCORING_THRESHOLDS.spendSomeHistoryMin) {
      const delta = 5
      score += delta
      reasoning.push({
        factor: "Client Spend",
        delta,
        note: `$${spent.toLocaleString()} total spent — some history`,
      })
    } else {
      const delta = -10
      score += delta
      reasoning.push({
        factor: "Client Spend",
        delta,
        note: `$${spent.toLocaleString()} total spent — low spending history`,
      })
      riskFlags.push("Low client spending history")
    }
  }

  // 8. Scope clarity
  const hasVagueSignals = VAGUE_SIGNALS.some((phrase) => text.includes(phrase))
  if (hasVagueSignals) {
    const delta = -15
    score += delta
    reasoning.push({
      factor: "Scope Clarity",
      delta,
      note: "Description contains vague scope signals",
    })
    riskFlags.push("Vague or unclear scope language")
  }
  if (job.description.length < SCORING_THRESHOLDS.minDescriptionLength) {
    const delta = -10
    score += delta
    reasoning.push({
      factor: "Scope Clarity",
      delta,
      note: `Very short description (${job.description.length} chars) — requirements likely underspecified`,
    })
    riskFlags.push("Very short description")
  }

  // 9. Combined risk: unverified payment + no spending history
  const noSpend =
    job.clientTotalSpent === null ||
    job.clientTotalSpent === undefined ||
    Number(job.clientTotalSpent) < SCORING_THRESHOLDS.spendNewClientMax
  if (!job.paymentVerified && noSpend) {
    const delta = -10
    score += delta
    reasoning.push({
      factor: "Client Risk",
      delta,
      note: "Unverified payment method with no spending history",
    })
    riskFlags.push("High risk: unverified payment and no spending history")
  }

  return { score: Math.max(0, Math.min(100, score)), reasoning, riskFlags }
}
