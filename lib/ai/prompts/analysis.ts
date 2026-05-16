import type { Job } from "@/lib/db/schema"

export function buildAnalysisPrompt(job: Job): string {
  const skills = (job.skills as string[]).join(", ")

  return `Analyze this Upwork job posting and provide a structured, actionable assessment.

JOB TITLE: ${job.title}
REQUIRED SKILLS: ${skills || "not specified"}

JOB DESCRIPTION:
${job.description}

Provide the following sections:

## Key Requirements
List the 3–5 most important technical and non-technical requirements extracted from the description.

## Red Flags
Identify concerns: vague scope, unrealistic expectations, low budget signals, unclear deliverables. Write "None identified" if the posting looks clean.

## Selling Points to Highlight
What specific experience, skills, or approach should the proposal emphasize to win this job?

## Clarifying Questions
2–3 smart questions to ask the client that demonstrate expertise and help scope the project.

Be concise and direct. Use bullet points within each section.`
}
