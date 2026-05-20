export interface SkillWeight {
  name: string
  weight: number
}

export interface FreelancerProfile {
  skills: SkillWeight[]
  minFixedBudget: number  // USD
  minHourlyRate: number   // USD/hr
}

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
