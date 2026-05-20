import { z } from "zod"

export const ParsedJobSchema = z.object({
  title: z.string().describe("Job title"),
  description: z.string().describe("Full job description text, cleaned up"),
  budgetType: z
    .enum(["fixed", "hourly"])
    .describe("Whether it's a fixed price or hourly rate project"),
  budgetMin: z
    .number()
    .nullable()
    .describe("Minimum budget in USD, null if not specified"),
  budgetMax: z
    .number()
    .nullable()
    .describe("Maximum budget in USD, null if not specified"),
  skills: z.array(z.string()).describe("List of required skills"),
  proposalCount: z
    .number()
    .nullable()
    .describe("Number of proposals/bids already submitted, null if not shown"),
  clientName: z
    .string()
    .nullable()
    .describe("Client or company name, null if not specified"),
  clientRating: z
    .number()
    .nullable()
    .describe("Client rating out of 5, null if not specified"),
  clientHireRate: z
    .number()
    .nullable()
    .describe(
      "Client hire rate as a percentage 0–100, null if not specified"
    ),
  clientTotalSpent: z
    .number()
    .nullable()
    .describe("Total amount the client has spent in USD, null if not specified"),
  paymentVerified: z
    .boolean()
    .describe("Whether the client payment method is verified"),
  url: z
    .string()
    .nullable()
    .describe("Job URL if found in the text, null otherwise"),
})

export type ParsedJob = z.infer<typeof ParsedJobSchema>

export function buildParsePrompt(text: string): string {
  return `Extract structured job information from the following raw job posting text. This may be copied from Upwork, Contra, LinkedIn, or any other freelancing platform.

RAW TEXT:
${text}

Extraction rules:
- For budgets like "$500–$1,000", set budgetMin=500, budgetMax=1000
- For "~$50/hr" or "$50.00/hr", set budgetType="hourly", budgetMin=50
- Skills: extract both explicitly listed skills AND clearly required technologies from the description body
- Client hire rate is shown as a percentage (e.g. "75% hire rate" → 75)
- Client total spent may appear as "$10K+" → use 10000, "$1.2M" → 1200000
- paymentVerified is true only if the text explicitly says "Payment verified" or equivalent
- If a field is not present in the text, use null
- Preserve the full description text as-is, just clean up any formatting artefacts`
}
