import type { Job } from "@/lib/db/schema"
import type { ProfileData } from "@/services/profile.service"

export function buildAnalysisPrompt(job: Job, profile: ProfileData): string {
  const jobSkills = (job.skills as string[]).join(", ")
  const mySkills = profile.skills.join(", ")

  return `Analyze this job posting against the freelancer's profile and provide a structured, actionable assessment.

JOB TITLE: ${job.title}
REQUIRED SKILLS: ${jobSkills || "not specified"}

JOB DESCRIPTION:
${job.description}

FREELANCER PROFILE:
Skills: ${mySkills || "not specified"}
Bio/Experience: ${profile.bio || "not provided"}

Provide the following sections:

## Key Requirements
List the 3–5 most important technical and non-technical requirements extracted from the description.

## Skill Gap Analysis
Compare the job requirements to the freelancer's profile:
- **Have**: skills and experience they possess that are relevant to this job
- **Gap**: skills or experience the job requires that they lack — mark each as (critical) or (nice-to-have)
- **Workaround**: for each critical gap, one concrete suggestion to de-risk it (e.g. transferable skill, quick ramp, transparency with client)
Write "No gaps identified" in the Gap section if they meet all requirements.

## Red Flags
Identify concerns: vague scope, unrealistic expectations, low budget signals, unclear deliverables. Write "None identified" if the posting looks clean.

## Selling Points to Highlight
What specific experience or skills from the freelancer's profile should the proposal emphasize to win this job?

## Clarifying Questions
2–3 smart questions to ask the client that demonstrate expertise and help scope the project.

Be concise and direct. Use bullet points within each section.`
}
