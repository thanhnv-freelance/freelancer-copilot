export function ScoreBadge({ score }: { score: number }) {
  const tier =
    score >= 75
      ? { label: "Great fit", cls: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" }
      : score >= 50
        ? { label: "Decent fit", cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" }
        : { label: "Poor fit", cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" }

  return (
    <div className="flex items-center gap-2">
      <span className={`text-3xl font-bold tabular-nums ${tier.cls.split(" ").slice(2).join(" ")}`}>
        {score}
      </span>
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tier.cls}`}>
        {tier.label}
      </span>
    </div>
  )
}
