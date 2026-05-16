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
    { name: "java", weight: 25 },
    { name: "payment", weight: 25 },
    { name: "aws", weight: 20 },
    { name: "kotlin", weight: 20 },
    { name: "postgresql", weight: 15 },
    { name: "microservices", weight: 15 },
    { name: "docker", weight: 10 },
    { name: "kubernetes", weight: 10 },
    { name: "react", weight: 10 },
    { name: "typescript", weight: 10 },
    { name: "next.js", weight: 10 },
    { name: "rest api", weight: 10 },
    { name: "graphql", weight: 8 },
  ],
  minFixedBudget: 500,
  minHourlyRate: 30,
}
