// Freelancer Copilot — Upwork content script
// Selectors verified against live Upwork HTML (nx/find-work saved-jobs slider + job tiles).

// ── Helpers ───────────────────────────────────────────────────────────────────

function getText(selector, root = document) {
  return root.querySelector(selector)?.textContent?.trim() ?? null
}

function parseSpent(text) {
  // "$21K", "$60K+", "$1.2M", "$500"
  const m = text.match(/\$([\d,.]+)\s*([KkMmBb]?)/)
  if (!m) return null
  let val = parseFloat(m[1].replace(/,/g, ""))
  const u = m[2].toUpperCase()
  if (u === "K") val *= 1000
  else if (u === "M") val *= 1_000_000
  else if (u === "B") val *= 1_000_000_000
  return String(Math.round(val))
}

function parseBudget(text) {
  const lower = text.toLowerCase()
  const isHourly =
    lower.includes("/hr") ||
    lower.includes("hourly") ||
    lower.includes("per hour") ||
    lower.includes("hrs/week")

  const range = text.match(/\$([\d,.]+)\s*[-–—]\s*\$([\d,.]+)/)
  if (range) {
    return {
      budgetType: isHourly ? "hourly" : "fixed",
      budgetMin: String(parseFloat(range[1].replace(/,/g, ""))),
      budgetMax: String(parseFloat(range[2].replace(/,/g, ""))),
    }
  }
  const single = text.match(/\$([\d,.]+)/)
  if (single) {
    return {
      budgetType: isHourly ? "hourly" : "fixed",
      budgetMin: String(parseFloat(single[1].replace(/,/g, ""))),
      budgetMax: null,
    }
  }
  return { budgetType: isHourly ? "hourly" : "fixed", budgetMin: null, budgetMax: null }
}

// Extract skill-like lines from the tail of the description text.
// Upwork appends skills as short keyword lines at the bottom of the description <p>.
function splitDescriptionAndSkills(fullText) {
  const lines = fullText.split("\n").map((l) => l.trim()).filter(Boolean)

  // A line looks like a skill tag if it:
  // - is ≤ 5 words
  // - contains no sentence-ending punctuation (no . , ; : ? !)
  //   (except dots in tech names like "Next.js", "Node.js")
  // - does not start with a dash/bullet
  function looksLikeSkill(line) {
    if (line.startsWith("-") || line.startsWith("•") || line.startsWith("*")) return false
    if (/[,;:?!]/.test(line)) return false
    // Allow dots only in tech patterns like "Next.js", "Node.js", "ASP.NET"
    if (/\.\s/.test(line) || /\.$/.test(line)) return false
    const words = line.split(/\s+/)
    return words.length <= 5 && line.length <= 50
  }

  // Walk from the bottom; collect skill lines until we hit prose
  let splitIdx = lines.length
  for (let i = lines.length - 1; i >= 0; i--) {
    if (looksLikeSkill(lines[i])) {
      splitIdx = i
    } else {
      // Allow one prose line gap (some descriptions have a blank separator)
      if (i < lines.length - 1 && splitIdx < lines.length) break
      else break
    }
  }

  const skills = lines.slice(splitIdx).filter(looksLikeSkill)
  const description = lines.slice(0, splitIdx).join("\n").trim()

  return { description: description || fullText, skills }
}

// ── Main extractor ────────────────────────────────────────────────────────────

function extractJob() {
  // ── Canonical URL ──────────────────────────────────────────────────────────
  // Prefer the "Open in new window" link inside the slider — it's the clean job URL
  const openLink = document.querySelector('[data-test="slider-open-in-new-window"]')
  const url =
    openLink?.getAttribute("href")?.split("?")[0] || window.location.href

  // ── Title ──────────────────────────────────────────────────────────────────
  // Slider: <h4><span class="flex-1">Title</span></h4>
  const sliderH4 = document.querySelector('[data-test="air3-slider"] h4')
  const title =
    sliderH4?.querySelector(".flex-1")?.textContent?.trim() ||
    sliderH4?.textContent?.trim() ||
    document.querySelector('[data-cy="job-title"]')?.textContent?.trim() ||
    document.querySelector('h1')?.textContent?.trim() ||
    document.title.replace(/\s*[|\-–]\s*Upwork.*$/i, "").trim()

  // ── Description + skills ───────────────────────────────────────────────────
  // The Description section holds both the prose body AND skill keywords (tail lines)
  const descEl = document.querySelector('[data-test="Description"] p')
    ?? document.querySelector('[data-test="Description"]')
    ?? document.querySelector('[data-test="job-description-text"]')

  const rawDescText = descEl?.innerText?.trim() ?? ""
  const { description, skills: extractedSkills } = splitDescriptionAndSkills(rawDescText)

  // ── Budget & job type ──────────────────────────────────────────────────────
  const jobTypeEl = document.querySelector('[data-test="job-type"]')
  const budgetEl  = document.querySelector('[data-test="budget"]')

  // Detect hourly via icon: data-cy="clock-hourly" only present for hourly jobs
  const isHourly =
    !!document.querySelector('[data-cy="clock-hourly"]') ||
    jobTypeEl?.textContent?.toLowerCase().includes("hourly") ||
    false

  let budgetType = isHourly ? "hourly" : "fixed"
  let budgetMin = null
  let budgetMax = null

  if (budgetEl) {
    const b = parseBudget((isHourly ? "hourly " : "") + budgetEl.textContent)
    budgetType = b.budgetType
    budgetMin  = b.budgetMin
    budgetMax  = b.budgetMax
  }

  // ── Proposals ─────────────────────────────────────────────────────────────
  // proposals-section is often collapsed; try to read the toggle label or tile data
  let proposalCount = null
  const propSection = document.querySelector('[data-test="proposals-section"]')
  if (propSection) {
    const t = propSection.textContent || ""
    const m = t.match(/(\d+)\s*to\s*(\d+)/i)
    if (m) proposalCount = Math.round((parseInt(m[1]) + parseInt(m[2])) / 2)
    else {
      const s = t.match(/(\d+)\s*proposal/i)
      if (s) proposalCount = parseInt(s[1])
    }
  }

  // ── Client info ────────────────────────────────────────────────────────────
  const clientContainer = document.querySelector('[data-test="about-client-container"]')

  let paymentVerified = false
  let clientRating    = null
  let clientHireRate  = null
  let clientTotalSpent = null
  let clientLocation  = null

  if (clientContainer) {
    // Payment verified: presence of .payment-verified div (green checkmark)
    paymentVerified = !!clientContainer.querySelector('.payment-verified')

    // Rating: [data-testid="buyer-rating"] .air3-rating-value-text  → "5.0"
    const ratingEl = clientContainer.querySelector('[data-testid="buyer-rating"] .air3-rating-value-text')
      ?? clientContainer.querySelector('[data-testid="buyer-rating"]')
    if (ratingEl) {
      const rm = ratingEl.textContent?.match(/([\d.]+)/)
      if (rm) clientRating = rm[1]
    }

    // Hire rate: [data-qa="client-job-posting-stats"] → "75% hire rate, 5 open jobs"
    const statsEl = clientContainer.querySelector('[data-qa="client-job-posting-stats"]')
    if (statsEl) {
      const sm = statsEl.textContent?.match(/(\d+)%\s*hire\s*rate/i)
      if (sm) clientHireRate = sm[1]
    }

    // Total spent: [data-qa="client-spend"] → "$21K total spent"
    const spentEl = clientContainer.querySelector('[data-qa="client-spend"]')
      ?? clientContainer.querySelector('[data-test="client-spendings"]')
      ?? clientContainer.querySelector('[data-test="formatted-amount"]')
    if (spentEl) {
      clientTotalSpent = parseSpent(spentEl.textContent || "")
    }

    // Location: [data-qa="client-location"] → "Liepaja"
    const locEl = clientContainer.querySelector('[data-qa="client-location"]')
    if (locEl) {
      clientLocation = locEl.querySelector("span.nowrap")?.textContent?.trim()
        ?? locEl.textContent?.replace(/\d{1,2}:\d{2}\s*(AM|PM)?/i, "").trim()
        ?? null
    }
  }

  return {
    title,
    description,
    skills: extractedSkills,
    budgetType,
    budgetMin,
    budgetMax,
    proposalCount,
    clientName: clientLocation,   // best available — no explicit client name field
    clientRating,
    clientHireRate,
    clientTotalSpent,
    paymentVerified,
    url: url.startsWith("http") ? url : window.location.href,
    source: "upwork",
  }
}

// ── Message listener ──────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "EXTRACT_JOB") {
    try {
      sendResponse({ ok: true, job: extractJob() })
    } catch (err) {
      sendResponse({ ok: false, error: String(err) })
    }
  }
  return true
})
