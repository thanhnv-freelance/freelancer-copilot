import { describe, it, expect } from "vitest"
import { scoreJob } from "./engine"
import type { Job } from "@/lib/db/schema"

function makeJob(overrides: Partial<Job> = {}): Job {
  return {
    id: "test-id",
    title: "Backend Developer",
    description: "We need a backend developer",
    budgetType: "fixed",
    budgetMin: null,
    budgetMax: null,
    skills: [],
    proposalCount: null,
    lastViewedByClient: null,
    hires: null,
    interviewing: null,
    invitesSent: null,
    clientName: null,
    clientLocation: null,
    clientRating: null,
    clientHireRate: null,
    clientTotalSpent: null,
    clientJobsPosted: null,
    clientAvgHourlyRate: null,
    clientHours: null,
    clientIndustry: null,
    clientMemberSince: null,
    paymentVerified: false,
    source: "upwork",
    url: null,
    status: "new",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

describe("scoreJob", () => {
  it("returns a score between 0 and 100", () => {
    const { score } = scoreJob(makeJob())
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })

  it("gives a bonus for spring boot skill match", () => {
    const without = scoreJob(makeJob()).score
    const with_ = scoreJob(makeJob({ skills: ["Spring Boot"] })).score
    expect(with_).toBeGreaterThan(without)
  })

  it("penalizes budget below minimum", () => {
    const high = scoreJob(makeJob({ budgetMin: "1000" })).score
    const low = scoreJob(makeJob({ budgetMin: "100" })).score
    expect(high).toBeGreaterThan(low)
  })

  it("rewards low proposal competition", () => {
    const low = scoreJob(makeJob({ proposalCount: 3 })).score
    const high = scoreJob(makeJob({ proposalCount: 30 })).score
    expect(low).toBeGreaterThan(high)
  })

  it("rewards payment verification", () => {
    const verified = scoreJob(makeJob({ paymentVerified: true })).score
    const unverified = scoreJob(makeJob({ paymentVerified: false })).score
    expect(verified).toBeGreaterThan(unverified)
  })

  it("includes reasoning items for each matched factor", () => {
    const { reasoning } = scoreJob(
      makeJob({
        skills: ["Spring Boot", "AWS"],
        paymentVerified: true,
        proposalCount: 2,
        budgetMin: "1000",
      })
    )
    expect(reasoning.length).toBeGreaterThan(0)
    const factors = reasoning.map((r) => r.factor)
    expect(factors).toContain("Skill Match")
    expect(factors).toContain("Competition")
    expect(factors).toContain("Payment Verified")
    expect(factors).toContain("Budget")
  })

  it("clamps score to 100 when many skills match", () => {
    const { score } = scoreJob(
      makeJob({
        skills: ["Spring Boot", "Java", "AWS", "Kotlin", "Payment", "PostgreSQL", "Microservices"],
        paymentVerified: true,
        proposalCount: 1,
        budgetMin: "5000",
        clientRating: "4.9",
        clientHireRate: "85",
      })
    )
    expect(score).toBeLessThanOrEqual(100)
  })

  it("rewards proven client with high total spent", () => {
    const high = scoreJob(makeJob({ clientTotalSpent: "15000" })).score
    const low = scoreJob(makeJob({ clientTotalSpent: "50" })).score
    expect(high).toBeGreaterThan(low)
  })

  it("adds risk flag for low client spending history", () => {
    const { riskFlags } = scoreJob(makeJob({ clientTotalSpent: "50", paymentVerified: true }))
    expect(riskFlags).toContain("Low client spending history")
  })

  it("penalizes vague scope language", () => {
    const vague = scoreJob(
      makeJob({ description: "This should be easy, just a quick fix for our site" })
    ).score
    const clear = scoreJob(
      makeJob({ description: "Build a Spring Boot microservice with JWT auth and PostgreSQL integration" })
    ).score
    expect(clear).toBeGreaterThan(vague)
  })

  it("adds risk flag for vague scope language", () => {
    const { riskFlags } = scoreJob(
      makeJob({ description: "This should be easy, just a quick fix" })
    )
    expect(riskFlags).toContain("Vague or unclear scope language")
  })

  it("adds risk flag for very short description", () => {
    const { riskFlags } = scoreJob(makeJob({ description: "Build a website" }))
    expect(riskFlags).toContain("Very short description")
  })

  it("adds high-risk flag for unverified payment with no spending history", () => {
    const { riskFlags } = scoreJob(
      makeJob({ paymentVerified: false, clientTotalSpent: null })
    )
    expect(riskFlags).toContain("High risk: unverified payment and no spending history")
  })

  it("does not flag combined risk when payment is verified", () => {
    const { riskFlags } = scoreJob(
      makeJob({ paymentVerified: true, clientTotalSpent: null })
    )
    expect(riskFlags).not.toContain("High risk: unverified payment and no spending history")
  })

  it("returns empty riskFlags for a clean job", () => {
    const { riskFlags } = scoreJob(
      makeJob({
        paymentVerified: true,
        clientTotalSpent: "20000",
        description: "Build a Spring Boot payment microservice with AWS deployment and PostgreSQL database. We need experience with Stripe integration and event-driven architecture.",
      })
    )
    expect(riskFlags).toHaveLength(0)
  })
})
