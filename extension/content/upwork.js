// Freelancer Copilot — Upwork content script
// Scrapes job data from the current Upwork job page.

function getText(selector, root = document) {
  return root.querySelector(selector)?.textContent?.trim() ?? null
}

function getAll(selectors, root = document) {
  for (const sel of selectors) {
    const els = Array.from(root.querySelectorAll(sel))
    const texts = els.map((el) => el.textContent?.trim()).filter(Boolean)
    if (texts.length > 0) return texts
  }
  return []
}

function parseSpent(text) {
  // "$10K+", "$1.2M", "$500", "10,000"
  const match = text.match(/\$([\d,.]+)\s*([KkMmBb]?)/)
  if (!match) return null
  let val = parseFloat(match[1].replace(/,/g, ""))
  const unit = match[2].toUpperCase()
  if (unit === "K") val *= 1000
  else if (unit === "M") val *= 1_000_000
  else if (unit === "B") val *= 1_000_000_000
  return String(Math.round(val))
}

function parseBudget(text) {
  const lower = text.toLowerCase()
  const isHourly = lower.includes("/hr") || lower.includes("hourly") || lower.includes("per hour")

  // Range: "$30.00–$50.00" or "$500 - $1,000"
  const rangeMatch = text.match(/\$([\d,.]+)\s*[-–—]\s*\$([\d,.]+)/)
  if (rangeMatch) {
    return {
      budgetType: isHourly ? "hourly" : "fixed",
      budgetMin: String(parseFloat(rangeMatch[1].replace(/,/g, ""))),
      budgetMax: String(parseFloat(rangeMatch[2].replace(/,/g, ""))),
    }
  }

  // Single value
  const single = text.match(/\$([\d,.]+)/)
  if (single) {
    return {
      budgetType: isHourly ? "hourly" : "fixed",
      budgetMin: String(parseFloat(single[1].replace(/,/g, ""))),
      budgetMax: null,
    }
  }

  return { budgetType: "fixed", budgetMin: null, budgetMax: null }
}

function parseProposals(text) {
  // "10 to 15 Proposals" → average; "5 proposals" → 5; "Less than 5" → 3
  const range = text.match(/(\d+)\s*to\s*(\d+)/i)
  if (range) return Math.round((parseInt(range[1]) + parseInt(range[2])) / 2)
  const single = text.match(/(\d+)/)
  if (single) return parseInt(single[1])
  return null
}

function extractJob() {
  const url = window.location.href

  // ── Title ──────────────────────────────────────────────────────────────────
  const title =
    getText('h1[data-test="job-title"]') ||
    getText("h1.job-title") ||
    getText('[data-cy="job-title"]') ||
    getText("h1") ||
    document.title.replace(/\s*[|\-–]\s*Upwork.*$/i, "").trim()

  // ── Description ────────────────────────────────────────────────────────────
  const descSelectors = [
    '[data-test="description"]',
    '[data-cy="job-description"]',
    ".description",
    '[data-ev-label="job_description"]',
    ".job-description",
    "section.description",
  ]
  let description = ""
  for (const sel of descSelectors) {
    const el = document.querySelector(sel)
    if (el?.innerText?.trim()) {
      description = el.innerText.trim()
      break
    }
  }

  // ── Skills ─────────────────────────────────────────────────────────────────
  const skills = getAll([
    '[data-test="skillTags"] a',
    '[data-test="skillTags"] span',
    '[data-cy="skill-tag"]',
    '[data-test="Skill"] span',
    ".skills-tags a",
    ".skill-tag",
    '[data-ev-label="skill_tag"]',
  ])
  const uniqueSkills = [...new Set(skills)]

  // ── Budget ─────────────────────────────────────────────────────────────────
  let budgetType = "fixed"
  let budgetMin = null
  let budgetMax = null

  const budgetSelectors = [
    '[data-test="budget"]',
    '[data-cy="budget"]',
    ".budget",
    '[data-test="hourly-rate"]',
    '[data-cy="hourly-rate"]',
  ]
  for (const sel of budgetSelectors) {
    const el = document.querySelector(sel)
    if (el?.textContent) {
      const b = parseBudget(el.textContent)
      budgetType = b.budgetType
      budgetMin = b.budgetMin
      budgetMax = b.budgetMax
      break
    }
  }

  // Fallback: scan page text for budget patterns in likely containers
  if (!budgetMin) {
    const candidates = document.querySelectorAll(
      "[class*='budget'], [class*='price'], [class*='rate'], [data-test*='budget'], [data-test*='rate']"
    )
    for (const el of candidates) {
      const t = el.textContent || ""
      if (/\$[\d,]/.test(t)) {
        const b = parseBudget(t)
        if (b.budgetMin) {
          budgetType = b.budgetType
          budgetMin = b.budgetMin
          budgetMax = b.budgetMax
          break
        }
      }
    }
  }

  // ── Proposals ──────────────────────────────────────────────────────────────
  let proposalCount = null
  const propSelectors = [
    '[data-test="proposals"]',
    '[data-cy="proposals-count"]',
    '[data-test="total-applicants"]',
  ]
  for (const sel of propSelectors) {
    const el = document.querySelector(sel)
    if (el?.textContent) {
      proposalCount = parseProposals(el.textContent)
      if (proposalCount !== null) break
    }
  }

  // Fallback: scan for text containing "proposals" or "bids"
  if (proposalCount === null) {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    let node
    while ((node = walker.nextNode())) {
      const t = node.textContent || ""
      if (/\bproposals?\b|\bbids?\b/i.test(t) && /\d/.test(t)) {
        proposalCount = parseProposals(t)
        if (proposalCount !== null) break
      }
    }
  }

  // ── Client info ────────────────────────────────────────────────────────────
  let clientName = null
  let clientRating = null
  let clientHireRate = null
  let clientTotalSpent = null
  let paymentVerified = false

  const clientSelectors = [
    '[data-test="client-info"]',
    '[data-cy="client-details"]',
    ".client-details",
    ".buyer-details",
    '[data-test="AboutClientSection"]',
    "section[data-test*='client']",
  ]

  let clientSection = null
  for (const sel of clientSelectors) {
    clientSection = document.querySelector(sel)
    if (clientSection) break
  }

  if (clientSection) {
    // Name
    clientName =
      getText('[data-test="client-name"]', clientSection) ||
      getText('[data-cy="client-name"]', clientSection) ||
      getText(".client-name", clientSection) ||
      getText("strong", clientSection)

    // Rating (e.g. "4.9 of 5" or just "4.9")
    const ratingEl =
      clientSection.querySelector('[data-test="client-rating"]') ||
      clientSection.querySelector('[data-cy="rating"]') ||
      clientSection.querySelector(".rating") ||
      clientSection.querySelector('[class*="rating"]')
    if (ratingEl) {
      const rm = ratingEl.textContent?.match(/([\d.]+)/)
      if (rm) clientRating = rm[1]
    }

    const clientText = clientSection.textContent || ""

    // Hire rate: "75% hire rate" or "Hired 5 times"
    const hireMatch = clientText.match(/(\d+)%\s*(?:hire\s*rate|hires?)/i)
    if (hireMatch) clientHireRate = hireMatch[1]

    // Total spent: "$10K+" or "$1.2M spent"
    const spentMatch = clientText.match(/(\$[\d,.]+\s*[KkMmBb]?)\+?\s*(?:spent|total)?/i)
    if (spentMatch) clientTotalSpent = parseSpent(spentMatch[1])

    // Payment verified
    paymentVerified =
      !!clientSection.querySelector('[data-test="payment-verified"]') ||
      !!clientSection.querySelector('[data-cy="payment-verified"]') ||
      !!clientSection.querySelector('[class*="payment-verified"]') ||
      clientText.toLowerCase().includes("payment verified")
  }

  return {
    title,
    description,
    skills: uniqueSkills,
    budgetType,
    budgetMin,
    budgetMax,
    proposalCount,
    clientName,
    clientRating,
    clientHireRate,
    clientTotalSpent,
    paymentVerified,
    url,
    source: "upwork",
  }
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "EXTRACT_JOB") {
    try {
      sendResponse({ ok: true, job: extractJob() })
    } catch (err) {
      sendResponse({ ok: false, error: String(err) })
    }
  }
  return true // keep channel open for async
})
