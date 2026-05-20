CREATE TABLE IF NOT EXISTS "freelancer_copilot"."applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"proposal_text" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"hourly_rate" numeric,
	"project_value" numeric,
	"feedback" text,
	"submitted_at" timestamp,
	"interview_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "freelancer_copilot"."assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"category" text DEFAULT 'proposal' NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "freelancer_copilot"."jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"budget_type" text DEFAULT 'fixed' NOT NULL,
	"budget_min" numeric,
	"budget_max" numeric,
	"skills" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"proposal_count" integer,
	"client_name" text,
	"client_rating" numeric,
	"client_hire_rate" numeric,
	"client_total_spent" numeric,
	"payment_verified" boolean DEFAULT false NOT NULL,
	"source" text DEFAULT 'upwork' NOT NULL,
	"url" text,
	"status" text DEFAULT 'new' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "freelancer_copilot"."leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"company" text,
	"source" text DEFAULT 'linkedin_dm' NOT NULL,
	"notes" text,
	"status" text DEFAULT 'new' NOT NULL,
	"value" numeric,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "freelancer_copilot"."profiles" (
	"id" text PRIMARY KEY DEFAULT 'default' NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"bio" text DEFAULT '' NOT NULL,
	"skills" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"min_fixed_budget" numeric DEFAULT '500' NOT NULL,
	"min_hourly_rate" numeric DEFAULT '30' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "freelancer_copilot"."scoring_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"score" integer NOT NULL,
	"reasoning" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"risk_flags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "freelancer_copilot"."applications" ADD CONSTRAINT "applications_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "freelancer_copilot"."jobs"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "freelancer_copilot"."scoring_results" ADD CONSTRAINT "scoring_results_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "freelancer_copilot"."jobs"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
