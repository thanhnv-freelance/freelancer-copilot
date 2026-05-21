export const PLATFORMS = [
  { value: "upwork", label: "Upwork" },
  { value: "contra", label: "Contra" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "wellfound", label: "Wellfound" },
  { value: "braintrust", label: "Braintrust" },
  { value: "arc", label: "Arc.dev" },
  { value: "other", label: "Other" },
] as const

export type PlatformValue = (typeof PLATFORMS)[number]["value"]

export function getPlatformLabel(value: string): string {
  return PLATFORMS.find((p) => p.value === value)?.label ?? value
}

// Web origins allowed to call the extension import endpoint.
// Add a platform's origin here when its browser extension is built.
export const PLATFORM_WEB_ORIGINS = new Set([
  "https://www.upwork.com",
  "https://www.linkedin.com",
])
