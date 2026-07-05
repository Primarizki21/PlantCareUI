import { TrendingUp, TrendingDown, Grid3X3, Activity } from "lucide-react";
import type { PatchSummaryData } from "../../types/detection";

interface PatchSummaryProps {
  summary: PatchSummaryData;
}

export function PatchSummary({ summary }: PatchSummaryProps) {
  const stats = [
    {
      label: "Healthy Patches",
      value: `${summary.healthy_patches} / ${summary.total_patches}`,
      sub: "classification count",
      icon: Grid3X3,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-950/30",
      border: "border-green-200 dark:border-green-800",
    },
    {
      label: "Healthy Area",
      value: `${summary.healthy_area.toFixed(2)}%`,
      sub: "total leaf coverage",
      icon: TrendingUp,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-950/30",
      border: "border-green-200 dark:border-green-800",
    },
    {
      label: "Unhealthy Area",
      value: `${summary.unhealthy_area.toFixed(2)}%`,
      sub: "affected leaf coverage",
      icon: TrendingDown,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-950/30",
      border: "border-red-200 dark:border-red-800",
    },
    {
      label: "Avg Confidence",
      value: `${summary.average_confidence.toFixed(1)}%`,
      sub: "model certainty",
      icon: Activity,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-950/30",
      border: "border-purple-200 dark:border-purple-800",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map(({ label, value, sub, icon: Icon, color, bg, border }) => (
        <div
          key={label}
          className={`p-3 rounded-lg border ${bg} ${border} text-center`}
        >
          <div className={`flex justify-center mb-1 ${color}`}>
            <Icon className="h-4 w-4" />
          </div>
          <p className={`text-xl font-bold ${color}`}>{value}</p>
          <p className="text-xs font-medium text-foreground leading-tight mt-0.5">{label}</p>
          <p className="text-xs text-muted-foreground">{sub}</p>
        </div>
      ))}
    </div>
  );
}
