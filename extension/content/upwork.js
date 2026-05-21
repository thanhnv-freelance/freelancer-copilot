// Freelancer Copilot — Upwork content script
// Selectors verified against live Upwork HTML (nx/find-work saved-jobs slider + job tiles).

// ── Utilities ─────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

function waitFor(fn, timeout = 8000) {
  return new Promise((resolve, reject) => {
    const start = Date.now()
    const poll = () => {
      const result = fn()
      if (result) return resolve(result)
      if (Date.now() - start > timeout) return reject(new Error("Timeout"))
      setTimeout(poll, 250)
    }
    poll()
  })
}

function getText(selector, root = document) {
  return root.querySelector(selector)?.textContent?.trim() ?? null
}

function parseSpent(text) {
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

function splitDescriptionAndSkills(fullText) {
  const lines = fullText.split("\n").map((l) => l.trim()).filter(Boolean)

  function looksLikeSkill(line) {
    if (line.startsWith("-") || line.startsWith("•") || line.startsWith("*")) return false
    if (/[,;:?!]/.test(line)) return false
    if (/\.\s/.test(line) || /\.$/.test(line)) return false
    const words = line.split(/\s+/)
    return words.length <= 5 && line.length <= 50
  }

  let splitIdx = lines.length
  for (let i = lines.length - 1; i >= 0; i--) {
    if (looksLikeSkill(lines[i])) {
      splitIdx = i
    } else {
      if (i < lines.length - 1 && splitIdx < lines.length) break
      else break
    }
  }

  const skills = lines.slice(splitIdx).filter(looksLikeSkill)
  const description = lines.slice(0, splitIdx).join("\n").trim()
  return { description: description || fullText, skills }
}

// ── Job extractor (slider) ────────────────────────────────────────────────────

function extractJob() {
  const openLink = document.querySelector('[data-test="slider-open-in-new-window"]')
  const url = openLink?.getAttribute("href")?.split("?")[0] || window.location.href

  const sliderH4 = document.querySelector('[data-test="air3-slider"] h4')
  const title =
    sliderH4?.querySelector(".flex-1")?.textContent?.trim() ||
    sliderH4?.textContent?.trim() ||
    document.querySelector('[data-cy="job-title"]')?.textContent?.trim() ||
    document.querySelector("h1")?.textContent?.trim() ||
    document.title.replace(/\s*[|\-–]\s*Upwork.*$/i, "").trim()

  const descEl =
    document.querySelector('[data-test="Description"] p') ??
    document.querySelector('[data-test="Description"]') ??
    document.querySelector('[data-test="job-description-text"]')

  const rawDescText = descEl?.innerText?.trim() ?? ""

  // Extract skills from the dedicated "Skills and Expertise" section first
  const domSkills = Array.from(document.querySelectorAll(".skills-list .air3-line-clamp"))
    .map((el) => el.textContent?.trim())
    .filter(Boolean)

  const { description, skills: heuristicSkills } = splitDescriptionAndSkills(rawDescText)
  const extractedSkills = domSkills.length > 0 ? domSkills : heuristicSkills

  const jobTypeEl = document.querySelector('[data-test="job-type"]')
  const budgetEl = document.querySelector('[data-test="budget"]')
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
    budgetMin = b.budgetMin
    budgetMax = b.budgetMax
  }

  // Activity on this job
  function getActivityText(label) {
    for (const item of document.querySelectorAll(".ca-item")) {
      const title = item.querySelector(".title")
      if (!title?.textContent?.toLowerCase().includes(label.toLowerCase())) continue
      const clone = item.cloneNode(true)
      clone.querySelector(".title")?.remove()
      clone.querySelectorAll(".help-icon, [data-test='popper']").forEach((el) => el.remove())
      return clone.textContent?.trim() || null
    }
    return null
  }
  function getActivityNum(label) {
    const text = getActivityText(label)
    if (!text) return null
    const m = text.match(/(\d+)/)
    return m ? parseInt(m[1]) : null
  }

  // Proposals — read from activity section (handles "50+"), fallback to proposals-section
  let proposalCount = null
  const proposalText = getActivityText("Proposals")
  if (proposalText) {
    const m = proposalText.match(/(\d+)/)
    if (m) proposalCount = parseInt(m[1])
  } else {
    const propSection = document.querySelector('[data-test="proposals-section"]')
    if (propSection) {
      const t = propSection.textContent || ""
      const m = t.match(/(\d+)\s*to\s*(\d+)/i)
      if (m) proposalCount = Math.round((parseInt(m[1]) + parseInt(m[2])) / 2)
      else {
        const s = t.match(/(\d+)/)
        if (s) proposalCount = parseInt(s[1])
      }
    }
  }

  const lastViewedByClient = getActivityText("Last viewed by client")
  const hires = getActivityNum("Hires")
  const interviewing = getActivityNum("Interviewing")
  const invitesSent = getActivityNum("Invites sent")

  // About the client
  const clientContainer = document.querySelector('[data-test="about-client-container"]')
  let paymentVerified = false
  let clientRating = null
  let clientHireRate = null
  let clientTotalSpent = null
  let clientLocation = null
  let clientJobsPosted = null
  let clientAvgHourlyRate = null
  let clientHours = null
  let clientIndustry = null
  let clientMemberSince = null

  if (clientContainer) {
    paymentVerified = !!clientContainer.querySelector(".payment-verified")

    const ratingEl =
      clientContainer.querySelector('[data-testid="buyer-rating"] .air3-rating-value-text') ??
      clientContainer.querySelector('[data-testid="buyer-rating"]')
    if (ratingEl) {
      const rm = ratingEl.textContent?.match(/([\d.]+)/)
      if (rm) clientRating = rm[1]
    }

    const statsEl = clientContainer.querySelector('[data-qa="client-job-posting-stats"]')
    if (statsEl) {
      const statsText = statsEl.textContent || ""
      const hm = statsText.match(/(\d+)%\s*hire\s*rate/i)
      if (hm) clientHireRate = hm[1]
      const jm = statsText.match(/(\d+)\s*jobs?\s*posted/i)
      if (jm) clientJobsPosted = parseInt(jm[1])
    }

    const spentEl =
      clientContainer.querySelector('[data-qa="client-spend"]') ??
      clientContainer.querySelector('[data-test="client-spendings"]') ??
      clientContainer.querySelector('[data-test="formatted-amount"]')
    if (spentEl) clientTotalSpent = parseSpent(spentEl.textContent || "")

    const locEl = clientContainer.querySelector('[data-qa="client-location"]')
    if (locEl) {
      clientLocation =
        locEl.querySelector("span.nowrap")?.textContent?.trim() ??
        locEl.textContent?.replace(/\d{1,2}:\d{2}\s*(AM|PM)?/i, "").trim() ??
        null
    }

    const hourlyRateEl = clientContainer.querySelector('[data-qa="client-hourly-rate"]')
    if (hourlyRateEl) {
      const rm = (hourlyRateEl.textContent || "").match(/\$([\d,.]+)/)
      if (rm) clientAvgHourlyRate = rm[1].replace(/,/g, "")
    }

    const hoursEl = clientContainer.querySelector('[data-qa="client-hours"]')
    if (hoursEl) {
      const hm = (hoursEl.textContent || "").match(/(\d[\d,]*)/)
      if (hm) clientHours = parseInt(hm[1].replace(/,/g, ""))
    }

    const industryEl = clientContainer.querySelector('[data-qa="client-company-profile-industry"]')
    if (industryEl) {
      clientIndustry = industryEl.firstChild?.textContent?.trim() || industryEl.textContent?.trim().split("\n")[0]?.trim() || null
    }

    const memberEl = clientContainer.querySelector('[data-qa="client-contract-date"]')
    if (memberEl) {
      clientMemberSince = memberEl.textContent?.replace(/member\s*since/i, "").trim() || null
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
    lastViewedByClient,
    hires,
    interviewing,
    invitesSent,
    clientName: null,
    clientLocation,
    clientRating,
    clientHireRate,
    clientTotalSpent,
    clientJobsPosted,
    clientAvgHourlyRate,
    clientHours,
    clientIndustry,
    clientMemberSince,
    paymentVerified,
    url: url.startsWith("http") ? url : window.location.href,
    source: "upwork",
  }
}

// ── Page detection ────────────────────────────────────────────────────────────

function detectPage() {
  // Both the regular feed AND the saved-jobs list use the same tile structure.
  // The saved-jobs details page (/saved-jobs/details/~02...) has a slider open
  // with those same tiles in the background — hasSlider takes priority there.
  const tiles = Array.from(
    document.querySelectorAll('[data-test="job-tile-list"] section[data-ev-opening_uid]')
  )
  const sliderTitle = document.querySelector('[data-test="air3-slider"] h4 .flex-1')
  const hasSlider = !!sliderTitle?.textContent?.trim()

  return {
    hasSlider,
    job: hasSlider ? extractJob() : null,
    tileCount: tiles.length,
    upworkIds: tiles.map((t) => t.getAttribute("data-ev-opening_uid")).filter(Boolean),
  }
}

// ── Bulk import ───────────────────────────────────────────────────────────────

let _stopBulk = false

async function bulkImport(appUrl, apiKey) {
  _stopBulk = false
  const processed = new Set()
  let imported = 0
  let skipped = 0
  let failed = 0

  function sendProgress(status, title = "") {
    try {
      chrome.runtime.sendMessage({
        type: "BULK_PROGRESS",
        imported,
        skipped,
        failed,
        processed: processed.size,
        status,
        title,
      })
    } catch {}
  }

  while (!_stopBulk) {
    // Collect unprocessed tiles
    const tiles = Array.from(
      document.querySelectorAll('[data-test="job-tile-list"] section[data-ev-opening_uid]')
    ).filter((t) => {
      const uid = t.getAttribute("data-ev-opening_uid")
      return uid && !processed.has(uid)
    })

    if (tiles.length === 0) {
      // Try "Load more"
      const loadMore = document.querySelector('[data-test="load-more-button"]')
      if (!loadMore || _stopBulk) break

      const countBefore = document.querySelectorAll(
        '[data-test="job-tile-list"] section[data-ev-opening_uid]'
      ).length
      loadMore.click()

      try {
        await waitFor(
          () =>
            document.querySelectorAll(
              '[data-test="job-tile-list"] section[data-ev-opening_uid]'
            ).length > countBefore,
          8000
        )
      } catch {
        break // no more pages
      }
      continue
    }

    // Batch duplicate check
    const batchIds = tiles
      .map((t) => t.getAttribute("data-ev-opening_uid"))
      .filter(Boolean)

    let existingIds = new Set()
    try {
      const res = await fetch(`${appUrl}/api/jobs/check-duplicates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ upworkIds: batchIds }),
      })
      if (res.ok) {
        const data = await res.json()
        existingIds = new Set(data.existing)
      }
    } catch {}

    for (const tile of tiles) {
      if (_stopBulk) break

      const uid = tile.getAttribute("data-ev-opening_uid")
      processed.add(uid)

      const tileTitle =
        tile.querySelector(".job-tile-title a")?.textContent?.trim() ||
        tile.querySelector("h3 a")?.textContent?.trim() ||
        "Job"

      if (existingIds.has(uid)) {
        skipped++
        sendProgress("skipping", tileTitle)
        continue
      }

      sendProgress("opening", tileTitle)

      // Click tile to open slider
      tile.click()

      try {
        // Wait for slider content to load
        await waitFor(
          () => document.querySelector('[data-test="air3-slider"] h4 .flex-1')?.textContent?.trim(),
          8000
        )
        await sleep(600) // let DOM settle

        const job = extractJob()

        const importRes = await fetch(`${appUrl}/api/extension/import`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(job),
        })

        if (importRes.ok) {
          imported++
        } else {
          failed++
        }
      } catch {
        failed++
      }

      // Close slider
      const backBtn =
        document.querySelector('[data-test="slider-go-back"]') ||
        document.querySelector('[data-test="slider-close-mobile"]')
      backBtn?.click()

      await sleep(600) // wait for slider to close
      sendProgress("progress", tileTitle)
    }
  }

  try {
    chrome.runtime.sendMessage({
      type: "BULK_COMPLETE",
      imported,
      skipped,
      failed,
      total: processed.size,
    })
  } catch {}
}

// ── Message listener ──────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "EXTRACT_JOB") {
    try {
      sendResponse({ ok: true, job: extractJob() })
    } catch (err) {
      sendResponse({ ok: false, error: String(err) })
    }
    return true
  }

  if (message.type === "SCAN_PAGE") {
    try {
      sendResponse({ ok: true, page: detectPage() })
    } catch (err) {
      sendResponse({ ok: false, error: String(err) })
    }
    return true
  }

  if (message.type === "BULK_IMPORT") {
    bulkImport(message.appUrl, message.apiKey)
    sendResponse({ ok: true })
    return true
  }

  if (message.type === "STOP_BULK_IMPORT") {
    _stopBulk = true
    sendResponse({ ok: true })
    return true
  }
})
