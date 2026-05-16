'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { ThemeToggle } from "@/components/nav/theme-toggle"

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", exact: true },
  { href: "/jobs", label: "Jobs" },
  { href: "/analytics", label: "Analytics" },
  { href: "/settings", label: "Settings" },
]

export function Sidebar() {
  const pathname = usePathname()

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href)
  }

  return (
    <aside className="w-52 shrink-0 border-r border-border bg-card flex flex-col">
      <div className="px-4 py-5 border-b border-border">
        <span className="text-sm font-semibold text-foreground">
          Freelancer Copilot
        </span>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {NAV_LINKS.map(({ href, label, exact }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
              isActive(href, exact)
                ? "bg-subtle text-foreground font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-border flex items-center justify-between">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Sign out
        </button>
        <ThemeToggle />
      </div>
    </aside>
  )
}
