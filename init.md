# Freelancer Copilot

AI-assisted freelancing workflow platform for opportunity analysis, proposal optimization, and project tracking.

---

# Vision

Freelancer Copilot is a lightweight productivity platform designed to help freelancers:

- analyze job opportunities
- rank project suitability
- optimize proposal strategy
- track applications
- monitor freelancing performance
- build reusable proposal assets
- generate AI-assisted insights

The initial focus is:
- Upwork workflow support
- lightweight architecture
- fast development iteration
- portfolio-quality engineering

Long-term vision:
- evolve into a multi-platform freelancer intelligence system

---

# Goals

## Business Goals

- Improve proposal quality
- Increase interview rate
- Reduce low-quality applications
- Identify high-fit projects quickly
- Build reusable freelancing workflows

---

## Technical Goals

- Lightweight architecture
- Minimal operational cost
- Fast local development
- Easy deployment
- Clean modular backend
- Strong portfolio showcase

---

# Recommended Lightweight Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router, Turbopack) |
| Styling | TailwindCSS v4 |
| Backend API | Next.js API Routes |
| Database | PostgreSQL (Neon) |
| ORM | Drizzle ORM |
| Authentication | NextAuth v5 |
| AI Integration | Vercel AI SDK (`ai`) + `@ai-sdk/anthropic` + `@ai-sdk/openai` |
| Hosting | Vercel |
| Scheduler | Vercel Cron |
| Validation | Zod |
| Charts | Recharts |
| Package Manager | pnpm |
| Testing | Vitest (unit) + Playwright (E2E) |
| Deployment | Vercel |
| CI/CD | GitHub Actions |

---

# Why This Stack

## Why Next.js Fullstack

Advantages:
- single repository
- lightweight deployment
- frontend + backend together
- minimal infrastructure management
- fast MVP iteration
- ideal for portfolio projects

---

## Why Drizzle ORM

Advantages:
- lightweight
- TypeScript-first
- simpler than Prisma
- excellent SQL visibility
- low complexity

---

## Why Vercel AI SDK

Advantages:
- provider-agnostic: swap between Claude, OpenAI, or local Ollama by changing only `baseURL` and model name
- first-class streaming support via `useChat` / `useCompletion` hooks — no custom streaming logic needed
- handles loading, error, and done state out of the box — no global state manager required for AI interactions
- primary model: Claude (`@ai-sdk/anthropic`); fallback: OpenAI (`@ai-sdk/openai`)

---

## Why Neon PostgreSQL

Advantages:
- free tier
- serverless PostgreSQL
- branching support
- simple integration

---

# Core MVP Features

---

# 1. Job Opportunity Dashboard

## Features

- list imported jobs
- filter by:
  - budget
  - technology
  - proposal count
  - client history
  - payment verified
- bookmark opportunities
- track viewed jobs

---

# 2. Job Match Scoring Engine

## Purpose

Calculate how suitable a job is for the freelancer.

---

## Scoring Inputs

| Factor | Example Weight |
|---|---|
| Spring Boot match | +30 |
| AWS match | +20 |
| Payment systems | +25 |
| Client payment verified | +10 |
| Low proposal competition | +15 |
| Budget too low | -20 |
| Unclear requirements | -10 |

---

## Output Example

```json
{
  "matchScore": 87,
  "summary": [
    "Strong backend alignment",
    "Payment integration experience relevant",
    "Low proposal competition"
  ]
}

3. AI Proposal Assistant
Features
summarize project requirements
suggest proposal strategy
generate proposal draft
identify important keywords
recommend technical angle
Example Prompt Flow

Input:

job description
freelancer profile
project category

Output:

proposal draft
recommended selling points
risk analysis
4. Application Tracker
Features

Track:

proposal status
interview status
client responses
hourly rate
project value
feedback
Dashboard Metrics
Metric	Description
Proposals Sent	total proposals
Response Rate	interviews / proposals
Win Rate	projects won
Revenue	total earnings
Average Hourly Rate	calculated metric
5. Reusable Assets Library
Store reusable:
proposal templates
architecture diagrams
API templates
introduction messages
technical checklists
Future Features
AI Opportunity Ranking

Use embeddings/vector similarity:

compare job descriptions
identify best-fit opportunities
Client Risk Detection

Analyze:

hire rate
payment verification
unclear scope
suspicious budgets
Proposal Analytics

Track:

proposal length
keywords
response success rate
Multi-Platform Support

Future integrations:

Upwork
Freelancer
Fiverr
LinkedIn jobs
Architecture
High-Level Architecture
+----------------------+
|      Frontend        |
|      Next.js UI      |
+----------+-----------+
           |
           v
+----------------------+
|   API Route Layer    |
|    Next.js Server    |
+----------+-----------+
           |
           v
+----------------------+
|    Service Layer     |
| Job / AI / Scoring   |
+----------+-----------+
           |
           v
+----------------------+
| PostgreSQL (Neon)    |
+----------------------+
Repository Structure
freelancer-copilot/
│
├── app/
│   ├── dashboard/
│   ├── jobs/
│   ├── analytics/
│   └── settings/
│
├── components/
│
├── lib/
│   ├── ai/
│   ├── db/
│   ├── scoring/
│   ├── parser/
│   └── utils/
│
├── services/
│
├── drizzle/
│
├── public/
│
├── docs/
│
├── scripts/
│
├── tests/
│
├── .env.example
│
├── README.md
│
└── package.json
Database Design
jobs
Column	Type
id	uuid
title	text
description	text
budget	numeric
skills	jsonb
proposal_count	int
client_name	text
payment_verified	boolean
source	text
created_at	timestamp
applications
Column	Type
id	uuid
job_id	uuid
proposal_text	text
status	text
submitted_at	timestamp
interview_at	timestamp
scoring_results
Column	Type
id	uuid
job_id	uuid
score	int
reasoning	jsonb
Development Roadmap
Phase 1 — Foundation
Goals
project setup
authentication
database integration
dashboard skeleton
Tasks
initialize Next.js project
setup Tailwind
setup Drizzle
connect Neon database
configure authentication
deploy to Vercel
Phase 2 — Job Management
Goals
job import
job listing
filtering
bookmarking
Tasks
create jobs table
build dashboard UI
create job detail page
add search/filter
Phase 3 — Scoring Engine
Goals
calculate match score
generate recommendations
Tasks
define scoring rules
implement scoring service
create score visualization
Phase 4 — AI Integration
Goals
proposal generation
requirement summarization
Tasks
integrate Vercel AI SDK with Anthropic (Claude) provider
build prompt templates
add AI suggestion UI with streaming
Phase 5 — Analytics
Goals
freelancing metrics dashboard
Tasks
build charts
calculate KPIs
weekly analytics reports
API Design
GET /api/jobs

Return all imported jobs.

POST /api/jobs/import

Import jobs manually or from external source.

POST /api/score

Calculate opportunity score.

POST /api/proposal/generate

Generate proposal draft using AI.

GET /api/analytics

Return freelancing analytics.

Environment Variables
DATABASE_URL=
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
Local Development
Install dependencies
pnpm install
Run locally
pnpm dev
Deployment
Frontend + Backend

Deploy using:

Vercel
Database

Use:

Neon PostgreSQL
CI/CD
GitHub Actions

Suggested pipeline:

install dependencies
lint
test
build
Coding Standards
TypeScript strict mode
ESLint
Prettier
feature-based structure
reusable components
service-oriented backend logic
Non-Functional Requirements
Requirement	Target
Lightweight	Yes
Mobile Responsive	Yes
Fast Initial Load	Yes
Easy Deployment	Yes
Minimal Cloud Cost	Yes
Portfolio Value

This project demonstrates:

API integration
AI-assisted workflows
backend architecture
cloud deployment
analytics systems
fullstack development
database design
product thinking
Future Expansion

Potential future evolution:

SaaS platform
subscription model
team collaboration
AI agent workflows
browser extension
proposal performance learning
freelancer marketplace analytics
Success Metrics
MVP Success
usable daily workflow
deployed production version
tracks real proposals
improves proposal quality
Long-Term Success
repeatable freelancing workflow
interview rate improvement
reusable AI proposal system
public portfolio showcase
Initial Setup Commands
npx create-next-app@latest freelancer-copilot
Install Dependencies
pnpm add drizzle-orm postgres zod ai @ai-sdk/anthropic @ai-sdk/openai next-auth recharts
Dev Dependencies
pnpm add -D drizzle-kit tailwindcss @tailwindcss/postcss eslint prettier vitest @playwright/test tsx dotenv-cli
Recommended First Milestone

Build:

dashboard UI
jobs table
manual job import
scoring engine

Avoid AI complexity initially.

Focus on:

clean architecture
working workflow
deployable MVP
Recommended Development Strategy
Week 1
setup project
deploy initial version
database integration
Week 2
build job dashboard
scoring system
filtering
Week 3
AI proposal assistant
analytics dashboard
Week 4
polish UI
improve architecture
portfolio documentation
Final Notes

Focus on:

consistency
iterative delivery
real usability
portfolio quality
maintainable architecture

Do not over-engineer the MVP.

The goal is:

practical daily usage
strong portfolio signal
foundation for future expansion