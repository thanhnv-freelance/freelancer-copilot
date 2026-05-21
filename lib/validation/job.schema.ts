import { z } from "zod"
import { PLATFORMS } from "@/lib/constants/platforms"

const platformValues = PLATFORMS.map((p) => p.value) as [
  (typeof PLATFORMS)[number]["value"],
  ...(typeof PLATFORMS)[number]["value"][],
]

// Canonical job schema — used by all API routes and the extension endpoint.
// All optional fields mirror the DB columns in lib/db/schema.ts.
export const jobSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  budgetType: z.enum(["fixed", "hourly"]).default("fixed"),
  budgetMin: z.string().optional().nullable(),
  budgetMax: z.string().optional().nullable(),
  skills: z.array(z.string()).default([]),
  proposalCount: z.number().int().optional().nullable(),
  lastViewedByClient: z.string().optional().nullable(),
  hires: z.number().int().optional().nullable(),
  interviewing: z.number().int().optional().nullable(),
  invitesSent: z.number().int().optional().nullable(),
  clientName: z.string().optional().nullable(),
  clientLocation: z.string().optional().nullable(),
  clientRating: z.string().optional().nullable(),
  clientHireRate: z.string().optional().nullable(),
  clientTotalSpent: z.string().optional().nullable(),
  clientJobsPosted: z.number().int().optional().nullable(),
  clientAvgHourlyRate: z.string().optional().nullable(),
  clientHours: z.number().int().optional().nullable(),
  clientIndustry: z.string().optional().nullable(),
  clientMemberSince: z.string().optional().nullable(),
  paymentVerified: z.boolean().default(false),
  source: z.enum(platformValues).default("upwork"),
  url: z.string().optional().nullable(),
  platformMeta: z.record(z.string(), z.unknown()).optional().nullable(),
})

export type JobInput = z.infer<typeof jobSchema>

// Form variant for server actions — FormData values are always strings,
// so numeric fields use coercion and checkboxes are normalised from "on".
export const jobFormSchema = jobSchema.extend({
  skills: z
    .string()
    .optional()
    .transform((v) =>
      (v ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    ),
  proposalCount: z.coerce.number().int().optional().nullable(),
  paymentVerified: z
    .string()
    .optional()
    .transform((v) => v === "on"),
  source: z.enum(platformValues).default("upwork"),
})
