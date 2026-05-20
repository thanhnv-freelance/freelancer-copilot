// Freelancer Copilot — popup script

const DEFAULT_APP_URL = "http://localhost:3005"

// ── DOM refs ──────────────────────────────────────────────────────────────────
const stateIdle         = document.getElementById("state-idle")
const stateLoading      = document.getElementById("state-loading")
const stateError        = document.getElementById("state-error")
const stateSuccess      = document.getElementById("state-success")
const stateList         = document.getElementById("state-list")
const stateBulkProgress = document.getElementById("state-bulk-progress")
const stateBulkComplete = document.getElementById("state-bulk-complete")
const jobPreview        = document.getElementById("job-preview")
const footer            = document.getElementById("footer")
const loadingMsg        = document.getElementById("loading-msg")
const errorMsg          = document.getElementById("error-msg")
const viewLink          = document.getElementById("view-link")
const previewTitle      = document.getElementById("preview-title")
const metaRow           = document.getElementById("meta-row")
const skillsRow         = document.getElementById("skills-row")
const clientRow         = document.getElementById("client-row")
const btnImport         = document.getElementById("btn-import")
const btnRetry          = document.getElementById("btn-retry")
const btnSettings       = document.getElementById("btn-settings")
const settingsPanel     = document.getElementById("settings-panel")
const inputAppUrl       = document.getElementById("input-app-url")
const inputApiKey       = document.getElementById("input-api-key")
const btnSave           = document.getElementById("btn-save-settings")
const saveOk            = document.getElementById("save-ok")
const listCount         = document.getElementById("list-count")
const btnBulkImport     = document.getElementById("btn-bulk-import")
const btnStopBulk       = document.getElementById("btn-stop-bulk")
const bulkProgressBar   = document.getElementById("bulk-progress-bar")
const bulkImported      = document.getElementById("bulk-imported")
const bulkSkipped       = document.getElementById("bulk-skipped")
const bulkFailed        = document.getElementById("bulk-failed")
const bulkProcessed     = document.getElementById("bulk-processed")
const bulkCurrent       = document.getElementById("bulk-current")
const bulkSummary       = document.getElementById("bulk-summary")
const bulkViewLink      = document.getElementById("bulk-view-link")

// ── State ─────────────────────────────────────────────────────────────────────
let currentJob = null
let settings = { appUrl: DEFAULT_APP_URL, apiKey: "" }

// ── Utilities ─────────────────────────────────────────────────────────────────
function show(...els) { els.forEach((el) => el.classList.remove("hidden")) }
function hide(...els) { els.forEach((el) => el.classList.add("hidden")) }

function showState(state) {
  hide(stateIdle, stateLoading, stateError, stateSuccess, jobPreview, footer,
       stateList, stateBulkProgress, stateBulkComplete)
  if (state === "idle")           show(stateIdle)
  if (state === "loading")        show(stateLoading)
  if (state === "error")          show(stateError)
  if (state === "success")        show(stateSuccess)
  if (state === "preview")        show(jobPreview, footer)
  if (state === "list")           show(stateList)
  if (state === "bulk-progress")  show(stateBulkProgress)
  if (state === "bulk-complete")  show(stateBulkComplete)
}

// ── Bulk progress display ─────────────────────────────────────────────────────
let _bulkTotal = 0

function updateBulkProgress(msg) {
  showState("bulk-progress")
  _bulkTotal = Math.max(_bulkTotal, msg.processed || 0)
  bulkImported.textContent  = msg.imported  ?? 0
  bulkSkipped.textContent   = msg.skipped   ?? 0
  bulkFailed.textContent    = msg.failed    ?? 0
  bulkProcessed.textContent = msg.processed ?? 0

  const pct = _bulkTotal > 0 ? Math.round((msg.processed / _bulkTotal) * 100) : 0
  bulkProgressBar.style.width = `${Math.min(pct, 100)}%`

  if (msg.status === "opening")  bulkCurrent.textContent = `Opening: ${msg.title}`
  if (msg.status === "skipping") bulkCurrent.textContent = `Skipping (duplicate): ${msg.title}`
  if (msg.status === "progress") bulkCurrent.textContent = `Imported: ${msg.title}`
}

function showBulkComplete(msg) {
  showState("bulk-complete")
  bulkSummary.textContent =
    `${msg.imported} imported · ${msg.skipped} duplicates · ${msg.failed} failed`
  bulkViewLink.href = `${settings.appUrl}/jobs`
}

function formatBudget(job) {
  if (!job.budgetMin) return null
  const type = job.budgetType === "hourly" ? "/hr" : " fixed"
  if (job.budgetMax) return `$${job.budgetMin}–$${job.budgetMax}${type}`
  return `$${job.budgetMin}${type}`
}

// ── Render job preview ────────────────────────────────────────────────────────
function renderPreview(job) {
  previewTitle.textContent = job.title || "(no title)"

  // Meta chips
  metaRow.innerHTML = ""
  const budget = formatBudget(job)
  if (budget) metaRow.innerHTML += `<span class="meta-chip">${budget}</span>`
  if (job.proposalCount) metaRow.innerHTML += `<span class="meta-chip">${job.proposalCount} proposals</span>`
  if (job.paymentVerified) metaRow.innerHTML += `<span class="meta-chip verified">✓ Payment Verified</span>`
  if (!metaRow.innerHTML) hide(metaRow)

  // Skills (show first 6 + overflow count)
  if (job.skills && job.skills.length > 0) {
    skillsRow.innerHTML = ""
    const shown = job.skills.slice(0, 6)
    shown.forEach((s) => {
      const span = document.createElement("span")
      span.className = "skill-tag"
      span.textContent = s
      skillsRow.appendChild(span)
    })
    if (job.skills.length > 6) {
      const more = document.createElement("span")
      more.className = "skills-more"
      more.textContent = `+${job.skills.length - 6} more`
      skillsRow.appendChild(more)
    }
    show(skillsRow)
  } else {
    hide(skillsRow)
  }

  // Client row
  const clientParts = []
  if (job.clientName) clientParts.push(job.clientName)
  if (job.clientRating) clientParts.push(`<span>${job.clientRating}★</span>`)
  if (job.clientHireRate) clientParts.push(`<span>${job.clientHireRate}% hire</span>`)
  if (job.clientTotalSpent) clientParts.push(`<span>$${Number(job.clientTotalSpent).toLocaleString()} spent</span>`)

  if (clientParts.length > 0) {
    clientRow.innerHTML = clientParts.join(" · ")
    show(clientRow)
  } else {
    hide(clientRow)
  }

  showState("preview")
}

// ── Scan active tab ───────────────────────────────────────────────────────────
async function scanTab() {
  showState("loading")
  loadingMsg.textContent = "Scanning page…"

  let tab
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
    tab = tabs[0]
  } catch {
    showError("Could not access active tab.")
    return
  }

  const url = tab.url || ""

  if (url && !url.includes("upwork.com")) {
    showState("idle")
    return
  }

  try {
    const response = await chrome.tabs.sendMessage(tab.id, { type: "SCAN_PAGE" })
    if (!response?.ok) throw new Error(response?.error || "Scan failed")

    const { page } = response

    if (page.hasSlider && page.job) {
      currentJob = page.job
      renderPreview(currentJob)
    } else if (page.tileCount > 0) {
      _bulkTotal = page.tileCount
      listCount.textContent = page.tileCount
      showState("list")
    } else {
      showState("idle")
    }
  } catch (err) {
    const msg = err.message || ""
    if (msg.includes("Receiving end does not exist") || msg.includes("Could not establish connection")) {
      if (url.includes("upwork.com")) {
        showError("Page is still loading — please wait a moment and try again.")
      } else {
        showState("idle")
      }
    } else {
      showError(`Could not scan page: ${msg}`)
    }
  }
}

// ── Import job ────────────────────────────────────────────────────────────────
async function importJob() {
  if (!currentJob) return

  if (!settings.apiKey) {
    showError("No API key set. Open settings (⚙) and enter your EXTENSION_API_KEY.")
    return
  }

  btnImport.disabled = true
  btnImport.textContent = "Importing…"
  loadingMsg.textContent = "Importing job…"

  try {
    const res = await fetch(`${settings.appUrl}/api/extension/import`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${settings.apiKey}`,
      },
      body: JSON.stringify(currentJob),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error ? JSON.stringify(data.error) : `HTTP ${res.status}`)
    }

    const { id } = await res.json()
    viewLink.href = `${settings.appUrl}/jobs/${id}`
    showState("success")
  } catch (err) {
    showError(`Import failed: ${err.message}`)
    btnImport.disabled = false
    btnImport.textContent = "Import Job"
  }
}

function showError(msg) {
  errorMsg.textContent = msg
  showState("error")
}

// ── Settings ──────────────────────────────────────────────────────────────────
async function loadSettings() {
  const stored = await chrome.storage.local.get(["appUrl", "apiKey"])
  settings.appUrl = stored.appUrl || DEFAULT_APP_URL
  settings.apiKey = stored.apiKey || ""
  inputAppUrl.value = settings.appUrl
  inputApiKey.value = settings.apiKey
}

async function saveSettings() {
  settings.appUrl = inputAppUrl.value.trim() || DEFAULT_APP_URL
  settings.apiKey = inputApiKey.value.trim()
  await chrome.storage.local.set({ appUrl: settings.appUrl, apiKey: settings.apiKey })
  saveOk.classList.add("show")
  setTimeout(() => saveOk.classList.remove("show"), 1800)
}

// ── Event listeners ───────────────────────────────────────────────────────────
btnImport.addEventListener("click", importJob)
btnRetry.addEventListener("click", scanTab)
btnSave.addEventListener("click", saveSettings)

btnSettings.addEventListener("click", () => {
  settingsPanel.classList.toggle("open")
})

btnBulkImport.addEventListener("click", async () => {
  if (!settings.apiKey) {
    showError("No API key set. Open settings (⚙) and enter your EXTENSION_API_KEY.")
    return
  }
  _bulkTotal = 0
  showState("bulk-progress")
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
  chrome.tabs.sendMessage(tabs[0].id, {
    type: "BULK_IMPORT",
    appUrl: settings.appUrl,
    apiKey: settings.apiKey,
  })
})

btnStopBulk.addEventListener("click", async () => {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
  chrome.tabs.sendMessage(tabs[0].id, { type: "STOP_BULK_IMPORT" })
})

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "BULK_PROGRESS") updateBulkProgress(message)
  if (message.type === "BULK_COMPLETE") showBulkComplete(message)
})

// ── Boot ──────────────────────────────────────────────────────────────────────
;(async () => {
  await loadSettings()
  await scanTab()
})()
