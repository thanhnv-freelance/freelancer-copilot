export interface SkillWeight {
  name: string
  weight: number
}

export interface FreelancerProfile {
  skills: SkillWeight[]
  minFixedBudget: number  // USD
  minHourlyRate: number   // USD/hr
}

export const SCORING_THRESHOLDS = {
  // Description length below which scope is flagged as underspecified
  minDescriptionLength: 150,

  // Proposal competition bands
  lowCompetitionMax: 5,
  highCompetitionMin: 20,

  // Client spend tiers (USD)
  spendProvenMin: 10_000,
  spendSomeHistoryMin: 1_000,
  spendNewClientMax: 100,   // below this → combined risk flag with unverified payment

  // Client rating thresholds (out of 5)
  ratingExcellentMin: 4.5,
  ratingPoorMax: 3.5,

  // Client hire rate thresholds (%)
  hireRateHighMin: 70,
  hireRateLowMax: 30,
} as const

// Personal profile — adjust weights to match your actual expertise
export const FREELANCER_PROFILE: FreelancerProfile = {
  skills: [
    { name: "spring boot", weight: 30 },
    { name: "java", weight: 28 },
    { name: "payment", weight: 25 },
    { name: "aws", weight: 22 },
    { name: "webflux", weight: 20 },
    { name: "microservices", weight: 18 },
    { name: "postgresql", weight: 15 },
    { name: "docker", weight: 15 },
    { name: "kubernetes", weight: 15 },
    { name: "ci/cd", weight: 12 },
    { name: "rest api", weight: 12 },
    { name: "oracle", weight: 10 },
    { name: "r2dbc", weight: 10 },
    { name: "react", weight: 10 },
    { name: "typescript", weight: 10 },
    { name: "next.js", weight: 10 },
    { name: "kotlin", weight: 8 },
    { name: "graphql", weight: 8 },
  ],
  minFixedBudget: 500,
  minHourlyRate: 30,
}
