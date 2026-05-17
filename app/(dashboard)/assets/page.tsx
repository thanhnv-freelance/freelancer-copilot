import { getAssets, ASSET_CATEGORIES } from "@/services/asset.service"
import { AssetList } from "@/components/assets/asset-list"
import { NewAssetButton } from "@/components/assets/new-asset-button"
import Link from "next/link"

const TABS = [
  { value: "all", label: "All" },
  ...ASSET_CATEGORIES,
]

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category = "all" } = await searchParams
  const assetList = await getAssets(
    category !== "all" ? { category } : undefined
  )

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-foreground">
          Assets
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({assetList.length})
          </span>
        </h1>
        <NewAssetButton />
      </div>

      <div className="flex gap-1 mb-6 flex-wrap">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={
              tab.value === "all"
                ? "/assets"
                : `/assets?category=${tab.value}`
            }
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              category === tab.value
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <AssetList assets={assetList} />
    </div>
  )
}
