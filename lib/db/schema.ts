import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgSchema,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"

// All tables live in the "freelancer_copilot" schema,
// keeping them isolated from other projects on the same Neon database.
const schema = pgSchema("freelancer_copilot")

// ─── Jobs ─────────────────────────────────────────────────────────────────────

export const jobs = schema.table("jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  budgetType: text("budget_type").notNull().default("fixed"), // "fixed" | "hourly"
  budgetMin: numeric("budget_min"),
  budgetMax: numeric("budget_max"),
  skills: jsonb("skills").$type<string[]>().notNull().default([]),
  proposalCount: integer("proposal_count"),
  lastViewedByClient: text("last_viewed_by_client"),
  hires: integer("hires"),
  interviewing: integer("interviewing"),
  invitesSent: integer("invites_sent"),
  clientName: text("client_name"),
  clientLocation: text("client_location"),
  clientRating: numeric("client_rating"),
  clientHireRate: numeric("client_hire_rate"),
  clientTotalSpent: numeric("client_total_spent"),
  clientJobsPosted: integer("client_jobs_posted"),
  clientAvgHourlyRate: numeric("client_avg_hourly_rate"),
  clientHours: integer("client_hours"),
  clientIndustry: text("client_industry"),
  clientMemberSince: text("client_member_since"),
  paymentVerified: boolean("payment_verified").notNull().default(false),
  source: text("source").notNull().default("upwork"),
  url: text("url"),
  // Platform-specific metadata that doesn't fit the common columns.
  // e.g. Upwork: { invitesSent, hires, interviewing, lastViewedByClient, ... }
  //      LinkedIn: { easyApply, posterTitle, posterCompany, applicantCount, connectionDegree }
  // Upwork-specific columns (proposalCount, clientJobsPosted, etc.) are candidates
  // for future migration here once LinkedIn data accumulates.
  platformMeta: jsonb("platform_meta").$type<Record<string, unknown>>().default({}),
  status: text("status").notNull().default("new"), // "new" | "viewed" | "bookmarked" | "applied" | "skipped"
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// ─── Applications ─────────────────────────────────────────────────────────────

export const applications = schema.table("applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobId: uuid("job_id")
    .notNull()
    .references(() => jobs.id, { onDelete: "cascade" }),
  proposalText: text("proposal_text"),
  status: text("status").notNull().default("draft"), // "draft" | "submitted" | "interviewing" | "won" | "lost"
  hourlyRate: numeric("hourly_rate"),
  projectValue: numeric("project_value"),
  feedback: text("feedback"),
  submittedAt: timestamp("submitted_at"),
  interviewAt: timestamp("interview_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// ─── Assets ───────────────────────────────────────────────────────────────────

export const assets = schema.table("assets", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  category: text("category").notNull().default("proposal"), // "proposal" | "intro" | "architecture" | "checklist"
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// ─── Leads ────────────────────────────────────────────────────────────────────

export const leads = schema.table("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  company: text("company"),
  source: text("source").notNull().default("linkedin_dm"), // "linkedin_dm" | "referral" | "direct" | "other"
  notes: text("notes"),
  status: text("status").notNull().default("new"), // "new" | "contacted" | "meeting" | "won" | "lost"
  value: numeric("value"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// ─── Profile ──────────────────────────────────────────────────────────────────

export type ExperienceEntry = {
  period: string
  company: string
  location: string
  focus: string
}

export const profiles = schema.table("profiles", {
  id: text("id").primaryKey().default("default"),
  name: text("name").notNull().default(""),
  title: text("title").notNull().default(""),
  bio: text("bio").notNull().default(""),
  skills: jsonb("skills").$type<string[]>().notNull().default([]),
  experience: jsonb("experience").$type<ExperienceEntry[]>().notNull().default([]),
  minFixedBudget: numeric("min_fixed_budget").notNull().default("500"),
  minHourlyRate: numeric("min_hourly_rate").notNull().default("30"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// ─── Scoring Results ───────────────────────────────────────────────────────────

export const scoringResults = schema.table("scoring_results", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobId: uuid("job_id")
    .notNull()
    .references(() => jobs.id, { onDelete: "cascade" }),
  score: integer("score").notNull(),
  reasoning: jsonb("reasoning")
    .$type<{ factor: string; delta: number; note: string }[]>()
    .notNull()
    .default([]),
  riskFlags: jsonb("risk_flags")
    .$type<string[]>()
    .notNull()
    .default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

// ─── Types ────────────────────────────────────────────────────────────────────

export type Job = typeof jobs.$inferSelect
export type NewJob = typeof jobs.$inferInsert
export type Application = typeof applications.$inferSelect
export type NewApplication = typeof applications.$inferInsert
export type ScoringResult = typeof scoringResults.$inferSelect
export type NewScoringResult = typeof scoringResults.$inferInsert
export type Asset = typeof assets.$inferSelect
export type NewAsset = typeof assets.$inferInsert
export type Profile = typeof profiles.$inferSelect
export type Lead = typeof leads.$inferSelect
export type NewLead = typeof leads.$inferInsert
