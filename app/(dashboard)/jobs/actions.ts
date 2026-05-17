"use server"

import { createJob } from "@/services/job.service"
import { computeAndSaveScore } from "@/services/scoring.service"
import { redirect } from "next/navigation"

export async function importJobAction(formData: FormData) {
  const skills = ((formData.get("skills") as string) ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)

  const budgetMin = formData.get("budgetMin") as string
  const budgetMax = formData.get("budgetMax") as string
  const proposalCount = formData.get("proposalCount") as string
  const clientRating = formData.get("clientRating") as string
  const clientHireRate = formData.get("clientHireRate") as string
  const clientTotalSpent = formData.get("clientTotalSpent") as string

  const job = await createJob({
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    budgetType: (formData.get("budgetType") as "fixed" | "hourly") ?? "fixed",
    budgetMin: budgetMin || null,
    budgetMax: budgetMax || null,
    skills,
    proposalCount: proposalCount ? Number(proposalCount) : null,
    clientName: (formData.get("clientName") as string) || null,
    clientRating: clientRating || null,
    clientHireRate: clientHireRate || null,
    clientTotalSpent: clientTotalSpent || null,
    paymentVerified: formData.get("paymentVerified") === "on",
    source: (formData.get("source") as string) || "upwork",
    url: (formData.get("url") as string) || null,
    status: "new",
  })

  await computeAndSaveScore(job)

  redirect(`/jobs/${job.id}`)
}
