import Link from "next/link"
import { ImportJobForm } from "@/components/jobs/import-form"

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
      <ImportJobForm />
    </div>
  )
}
