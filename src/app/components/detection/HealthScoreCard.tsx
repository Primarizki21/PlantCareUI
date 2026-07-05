import { Progress } from "../ui/progress";

interface HealthScoreCardProps {
  healthScore: number;
}

function getHealthScoreColor(score: number): string {
  if (score >= 80) return "text-green-600 dark:text-green-400";
  if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
  if (score >= 40) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
}

export function HealthScoreCard({ healthScore }: HealthScoreCardProps) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium">Overall Health Score</span>
        <span className={`text-sm font-bold ${getHealthScoreColor(healthScore)}`}>
          {healthScore.toFixed(0)}/100
        </span>
      </div>
      <Progress value={healthScore} className="h-2" />
    </div>
  );
}
