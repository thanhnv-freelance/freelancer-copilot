import { signIn } from "@/auth"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-sm">
        <h1 className="mb-6 text-xl font-semibold text-foreground">
          Freelancer Copilot
        </h1>
        <form
          action={async (formData: FormData) => {
            "use server"
            await signIn("credentials", {
              password: formData.get("password"),
              redirectTo: "/dashboard",
            })
          }}
        >
          <label
            htmlFor="password"
            className="mb-1 block text-sm font-medium text-muted-foreground"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="mb-4 w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground outline-none focus:border-foreground focus:ring-1 focus:ring-foreground"
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-80"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  )
}
