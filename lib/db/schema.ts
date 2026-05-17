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
  clientName: text("client_name"),
  clientRating: numeric("client_rating"),
  clientHireRate: numeric("client_hire_rate"),
  clientTotalSpent: numeric("client_total_spent"),
  paymentVerified: boolean("payment_verified").notNull().default(false),
  source: text("source").notNull().default("upwork"),
  url: text("url"),
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
