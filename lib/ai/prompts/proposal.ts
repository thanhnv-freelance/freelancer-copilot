import type { Job } from "@/lib/db/schema"

// Edit this profile to match your actual background
const FREELANCER_BIO = `
- Expertise: Java, Spring Boot, AWS, Payment Systems, PostgreSQL, Kotlin, Microservices, Docker
- Experience: 5+ years backend development specializing in payment integrations and enterprise Java apps
- Approach: clean architecture, API-first design, thorough documentation
`.trim()

export function buildProposalPrompt(job: Job): string {
  const skills = (job.skills as string[]).join(", ")
  const budget =
    job.budgetType === "fixed"
      ? `$${job.budgetMin ?? job.budgetMax ?? "unspecified"} fixed`
      : `$${job.budgetMin ?? "?"}–$${job.budgetMax ?? "?"}/hr hourly`

  return `You are writing a freelance proposal on behalf of a developer. Generate a compelling, personalized Upwork proposal.

FREELANCER PROFILE:
${FREELANCER_BIO}

JOB DETAILS:
Title: ${job.title}
Budget: ${budget}
Required Skills: ${skills || "not specified"}

JOB DESCRIPTION:
${job.description}

INSTRUCTIONS:
- Open with a direct, specific hook that references the client's actual problem — no generic openers
- Demonstrate understanding of the specific requirements (be concrete, name technologies)
- Mention directly relevant past experience or approach
- Propose a brief implementation plan (2–3 steps)
- End with a confident, low-friction call to action
- Keep it under 280 words
- Write in first person, professional but conversational tone`
}
