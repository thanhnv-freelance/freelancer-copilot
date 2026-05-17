export const ASSET_CATEGORIES = [
  { value: "proposal", label: "Proposal" },
  { value: "intro", label: "Introduction" },
  { value: "architecture", label: "Architecture" },
  { value: "checklist", label: "Checklist" },
] as const

export type AssetCategory = (typeof ASSET_CATEGORIES)[number]["value"]
