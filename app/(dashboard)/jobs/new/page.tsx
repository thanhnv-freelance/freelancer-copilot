import Link from "next/link"
import { importJobAction } from "@/app/(dashboard)/jobs/actions"

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

export default function NewJobPage() {
  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/jobs"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; Jobs
        </Link>
        <h1 className="text-xl font-semibold text-foreground">Import Job</h1>
      </div>

      <form action={importJobAction} className="space-y-5">
        <Field label="Job Title" name="title" required>
          <input
            id="title"
            type="text"
            name="title"
            required
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
            className={inputClass}
            placeholder="Paste the full job description from Upwork..."
          />
        </Field>

        <div className="grid grid-cols-3 gap-3">
          <Field label="Budget Type" name="budgetType">
            <select id="budgetType" name="budgetType" className={inputClass}>
              <option value="fixed">Fixed</option>
              <option value="hourly">Hourly</option>
            </select>
          </Field>
          <Field label="Budget Min ($)" name="budgetMin">
            <input
              id="budgetMin"
              type="number"
              name="budgetMin"
              className={inputClass}
              placeholder="500"
            />
          </Field>
          <Field label="Budget Max ($)" name="budgetMax">
            <input
              id="budgetMax"
              type="number"
              name="budgetMax"
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
            className={inputClass}
            placeholder="Java, Spring Boot, AWS, PostgreSQL"
          />
        </Field>

        <Field label="Proposal Count" name="proposalCount">
          <input
            id="proposalCount"
            type="number"
            name="proposalCount"
            className={inputClass}
            placeholder="5"
          />
        </Field>

        <div className="border-t border-border pt-5">
          <h2 className="text-sm font-medium text-foreground mb-4">Client Info</h2>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Client Name" name="clientName">
              <input
                id="clientName"
                type="text"
                name="clientName"
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
                className={inputClass}
                placeholder="75"
              />
            </Field>
            <Field label="Total Spent ($)" name="clientTotalSpent">
              <input
                id="clientTotalSpent"
                type="number"
                name="clientTotalSpent"
                className={inputClass}
                placeholder="10000"
              />
            </Field>
          </div>
          <label className="flex items-center gap-2 mt-3 cursor-pointer">
            <input type="checkbox" name="paymentVerified" className="rounded" />
            <span className="text-sm text-foreground">Payment Verified</span>
          </label>
        </div>

        <Field label="Upwork URL" name="url">
          <input
            id="url"
            type="url"
            name="url"
            className={inputClass}
            placeholder="https://www.upwork.com/jobs/~..."
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
