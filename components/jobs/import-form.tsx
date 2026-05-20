"use client"

import { useState } from "react"
import Link from "next/link"
import { importJobAction } from "@/app/(dashboard)/jobs/actions"
import { PLATFORMS } from "@/lib/constants/platforms"
import type { ParsedJob } from "@/lib/ai/prompts/parse"

const inputClass =
  "w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground outline-none focus:border-foreground focus:ring-1 focus:ring-foreground"

function Field({
  label,
  name,
  required,
  children,
}: {
  label: string
  name: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1 block text-xs font-medium text-muted-foreground"
      >
        {label}
        {required && " *"}
      </label>
      {children}
    </div>
  )
}

export function ImportJobForm() {
  const [rawText, setRawText] = useState("")
  const [isParsing, setIsParsing] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)
  const [parsed, setParsed] = useState<ParsedJob | null>(null)
  const [formKey, setFormKey] = useState(0)

  async function handleParse() {
    if (!rawText.trim()) return
    setIsParsing(true)
    setParseError(null)
    try {
      const res = await fetch("/api/jobs/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: rawText }),
      })
      if (!res.ok) throw new Error("Parse failed")
      const data: ParsedJob = await res.json()
      setParsed(data)
      setFormKey((k) => k + 1)
    } catch {
      setParseError("Failed to parse. Try again or fill in manually below.")
    } finally {
      setIsParsing(false)
    }
  }

  const d = parsed

  return (
    <div className="space-y-6">
      {/* Paste & Parse section */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-medium text-foreground mb-1">
          Paste job text
        </h2>
        <p className="text-xs text-muted-foreground mb-3">
          Copy the full job posting from Upwork, Contra, or any platform and
          paste it below. AI will extract all fields automatically.
        </p>
        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          rows={6}
          className={inputClass}
          placeholder="Paste the raw job posting here…"
        />
        {parseError && (
          <p className="text-xs text-red-500 mt-2">{parseError}</p>
        )}
        <div className="flex items-center gap-3 mt-3">
          <button
            type="button"
            onClick={handleParse}
            disabled={isParsing || !rawText.trim()}
            className="px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-40"
          >
            {isParsing ? "Parsing…" : "Auto-fill from text"}
          </button>
          {parsed && (
            <span className="text-xs text-green-600 dark:text-green-400">
              Parsed — review the fields below and submit.
            </span>
          )}
        </div>
      </div>

      {/* Job form — key resets defaultValues when parse result arrives */}
      <form key={formKey} action={importJobAction} className="space-y-5">
        <Field label="Job Title" name="title" required>
          <input
            id="title"
            type="text"
            name="title"
            required
            defaultValue={d?.title ?? ""}
            className={inputClass}
            placeholder="e.g. Senior Java Developer for Payment System"
          />
        </Field>

        <Field label="Description" name="description" required>
          <textarea
            id="description"
            name="description"
            required
            rows={10}
            defaultValue={d?.description ?? ""}
            className={inputClass}
            placeholder="Paste the full job description…"
          />
        </Field>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Field label="Platform" name="source">
            <select id="source" name="source" className={inputClass}>
              {PLATFORMS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Budget Type" name="budgetType">
            <select
              id="budgetType"
              name="budgetType"
              defaultValue={d?.budgetType ?? "fixed"}
              className={inputClass}
            >
              <option value="fixed">Fixed</option>
              <option value="hourly">Hourly</option>
            </select>
          </Field>
          <Field label="Budget Min ($)" name="budgetMin">
            <input
              id="budgetMin"
              type="number"
              name="budgetMin"
              defaultValue={d?.budgetMin ?? ""}
              className={inputClass}
              placeholder="500"
            />
          </Field>
          <Field label="Budget Max ($)" name="budgetMax">
            <input
              id="budgetMax"
              type="number"
              name="budgetMax"
              defaultValue={d?.budgetMax ?? ""}
              className={inputClass}
              placeholder="2000"
            />
          </Field>
        </div>

        <Field label="Skills (comma-separated)" name="skills">
          <input
            id="skills"
            type="text"
            name="skills"
            defaultValue={d?.skills?.join(", ") ?? ""}
            className={inputClass}
            placeholder="Java, Spring Boot, AWS, PostgreSQL"
          />
        </Field>

        <Field label="Proposal Count" name="proposalCount">
          <input
            id="proposalCount"
            type="number"
            name="proposalCount"
            defaultValue={d?.proposalCount ?? ""}
            className={inputClass}
            placeholder="5"
          />
        </Field>

        <div className="border-t border-border pt-5">
          <h2 className="text-sm font-medium text-foreground mb-4">
            Client Info
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Client Name" name="clientName">
              <input
                id="clientName"
                type="text"
                name="clientName"
                defaultValue={d?.clientName ?? ""}
                className={inputClass}
              />
            </Field>
            <Field label="Rating (0–5)" name="clientRating">
              <input
                id="clientRating"
                type="number"
                name="clientRating"
                step="0.1"
                min="0"
                max="5"
                defaultValue={d?.clientRating ?? ""}
                className={inputClass}
                placeholder="4.8"
              />
            </Field>
            <Field label="Hire Rate (%)" name="clientHireRate">
              <input
                id="clientHireRate"
                type="number"
                name="clientHireRate"
                min="0"
                max="100"
                defaultValue={d?.clientHireRate ?? ""}
                className={inputClass}
                placeholder="75"
              />
            </Field>
            <Field label="Total Spent ($)" name="clientTotalSpent">
              <input
                id="clientTotalSpent"
                type="number"
                name="clientTotalSpent"
                defaultValue={d?.clientTotalSpent ?? ""}
                className={inputClass}
                placeholder="10000"
              />
            </Field>
          </div>
          <label className="flex items-center gap-2 mt-3 cursor-pointer">
            <input
              type="checkbox"
              name="paymentVerified"
              defaultChecked={d?.paymentVerified ?? false}
              className="rounded"
            />
            <span className="text-sm text-foreground">Payment Verified</span>
          </label>
        </div>

        <Field label="Job URL" name="url">
          <input
            id="url"
            type="url"
            name="url"
            defaultValue={d?.url ?? ""}
            className={inputClass}
            placeholder="https://…"
          />
        </Field>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="rounded-lg bg-foreground px-5 py-2 text-sm font-medium text-background hover:opacity-80 transition-opacity"
          >
            Import Job
          </button>
          <Link
            href="/jobs"
            className="rounded-lg border border-border px-5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
