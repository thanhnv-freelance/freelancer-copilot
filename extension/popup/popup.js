// Freelancer Copilot — popup script

const DEFAULT_APP_URL = "http://localhost:3005"

// ── DOM refs ──────────────────────────────────────────────────────────────────
const stateIdle    = document.getElementById("state-idle")
const stateLoading = document.getElementById("state-loading")
const stateError   = document.getElementById("state-error")
const stateSuccess = document.getElementById("state-success")
const jobPreview   = document.getElementById("job-preview")
const footer       = document.getElementById("footer")
const loadingMsg   = document.getElementById("loading-msg")
const errorMsg     = document.getElementById("error-msg")
const viewLink     = document.getElementById("view-link")
const previewTitle = document.getElementById("preview-title")
const metaRow      = document.getElementById("meta-row")
const skillsRow    = document.getElementById("skills-row")
const clientRow    = document.getElementById("client-row")
const btnImport    = document.getElementById("btn-import")
const btnRetry     = document.getElementById("btn-retry")
const btnSettings  = document.getElementById("btn-settings")
const settingsPanel= document.getElementById("settings-panel")
const inputAppUrl  = document.getElementById("input-app-url")
const inputApiKey  = document.getElementById("input-api-key")
const btnSave      = document.getElementById("btn-save-settings")
const saveOk       = document.getElementById("save-ok")

// ── State ─────────────────────────────────────────────────────────────────────
let currentJob = null
let settings = { appUrl: DEFAULT_APP_URL, apiKey: "" }

// ── Utilities ─────────────────────────────────────────────────────────────────
function show(...els) { els.forEach((el) => el.classList.remove("hidden")) }
function hide(...els) { els.forEach((el) => el.classList.add("hidden")) }

function showState(state) {
  hide(stateIdle, stateLoading, stateError, stateSuccess, jobPreview, footer)
  if (state === "idle")    show(stateIdle)
  if (state === "loading") show(stateLoading)
  if (state === "error")   show(stateError)
  if (state === "success") show(stateSuccess)
  if (state === "preview") show(jobPreview, footer)
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

// ── Extract from active tab ───────────────────────────────────────────────────
async function extractJob() {
  showState("loading")
  loadingMsg.textContent = "Extracting job data…"

  let tab
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
    tab = tabs[0]
  } catch {
    showError("Could not access active tab.")
    return
  }

  const url = tab.url || ""

  // If we can read the URL and it's clearly not a job page, show idle immediately
  if (url && !url.includes("upwork.com/jobs/") && !url.includes("upwork.com/ab/applicants/")) {
    showState("idle")
    return
  }

  try {
    const response = await chrome.tabs.sendMessage(tab.id, { type: "EXTRACT_JOB" })
    if (!response?.ok) throw new Error(response?.error || "Extraction failed")
    currentJob = response.job
    renderPreview(currentJob)
  } catch (err) {
    const msg = err.message || ""
    if (msg.includes("Receiving end does not exist") || msg.includes("Could not establish connection")) {
      // Content script not injected — either not on a job page or page still loading
      if (!url || url.includes("upwork.com")) {
        showError("Open a specific Upwork job page, then try again.")
      } else {
        showState("idle")
      }
    } else {
      showError(`Could not extract job data: ${msg}`)
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
btnRetry.addEventListener("click", extractJob)
btnSave.addEventListener("click", saveSettings)

btnSettings.addEventListener("click", () => {
  settingsPanel.classList.toggle("open")
})

// ── Boot ──────────────────────────────────────────────────────────────────────
;(async () => {
  await loadSettings()
  await extractJob()
})()
