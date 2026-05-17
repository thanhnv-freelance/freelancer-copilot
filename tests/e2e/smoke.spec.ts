import { test, expect } from "@playwright/test"

const TEST_EMAIL = process.env.E2E_EMAIL ?? "test@example.com"
const TEST_PASSWORD = process.env.E2E_PASSWORD ?? "password"

test.describe("Smoke — core workflow", () => {
  test("login page is accessible", async ({ page }) => {
    await page.goto("/login")
    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible()
  })

  test("unauthenticated redirect to login", async ({ page }) => {
    await page.goto("/jobs")
    await expect(page).toHaveURL(/\/login/)
  })

  test("full workflow: login → jobs list → import job → see score badge", async ({ page }) => {
    // Sign in
    await page.goto("/login")
    await page.getByLabel(/email/i).fill(TEST_EMAIL)
    await page.getByLabel(/password/i).fill(TEST_PASSWORD)
    await page.getByRole("button", { name: /sign in/i }).click()
    await expect(page).toHaveURL(/\/(dashboard|jobs)/, { timeout: 10_000 })

    // Navigate to jobs
    await page.goto("/jobs")
    await expect(page.getByRole("heading", { name: /jobs/i })).toBeVisible()

    // Import a job
    await page.getByRole("link", { name: /import job/i }).click()
    await expect(page).toHaveURL(/\/jobs\/new/)

    await page.getByLabel(/title/i).fill("E2E Test Job")
    await page.getByLabel(/description/i).fill(
      "We need a Spring Boot developer with AWS experience to build a payment microservice. The project involves PostgreSQL, REST APIs, and Docker deployment. Minimum 3 months engagement."
    )
    await page.getByRole("button", { name: /import/i }).click()

    // Should redirect to job detail
    await expect(page).toHaveURL(/\/jobs\/[a-z0-9-]+$/, { timeout: 10_000 })

    // Score panel should be present (auto-scored on import)
    await expect(page.getByText(/match score/i)).toBeVisible()
  })

  test("jobs list shows score badges for scored jobs", async ({ page }) => {
    await page.goto("/login")
    await page.getByLabel(/email/i).fill(TEST_EMAIL)
    await page.getByLabel(/password/i).fill(TEST_PASSWORD)
    await page.getByRole("button", { name: /sign in/i }).click()
    await page.goto("/jobs")
    // If any jobs exist and are scored, a numeric score should be visible
    const scoreEl = page.locator(".tabular-nums").first()
    // Just check the page loads cleanly — score badge presence depends on data
    await expect(page.getByRole("heading", { name: /jobs/i })).toBeVisible()
    await expect(scoreEl).not.toHaveCount(0)
  })
})
