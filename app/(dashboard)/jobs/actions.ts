"use server"

import { createJob } from "@/services/job.service"
import { computeAndSaveScore } from "@/services/scoring.service"
import { jobFormSchema } from "@/lib/validation/job.schema"
import { redirect } from "next/navigation"

export async function importJobAction(formData: FormData) {
  const parsed = jobFormSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    throw new Error(JSON.stringify(parsed.error.flatten()))
  }

  const job = await createJob({ ...parsed.data, status: "new" })
  await computeAndSaveScore(job)

  redirect(`/jobs/${job.id}`)
}
