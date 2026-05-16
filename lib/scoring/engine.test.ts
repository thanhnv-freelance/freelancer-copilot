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
    clientName: null,
    clientRating: null,
    clientHireRate: null,
    clientTotalSpent: null,
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
})
