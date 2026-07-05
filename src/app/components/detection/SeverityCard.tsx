import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import type { Severity } from "../../services/detectionApi";

interface SeverityCardProps {
  severity: Severity;
  unhealthyPercentage: number;
}

function getSeverityColor(severity: Severity): string {
  switch (severity) {
    case "None":     return "bg-green-500";
    case "Low":      return "bg-yellow-500";
    case "Medium":   return "bg-orange-500";
    case "High":     return "bg-red-500";
    case "Critical": return "bg-red-700";
  }
}

function getSeverityProgress(unhealthyPercentage: number): number {
  return Math.min(100, Math.max(0, unhealthyPercentage));
}

export function SeverityCard({ severity, unhealthyPercentage }: SeverityCardProps) {
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Severity Level</span>
        <Badge className={`${getSeverityColor(severity)} text-white`}>
          {severity}
        </Badge>
      </div>
      <Progress value={getSeverityProgress(unhealthyPercentage)} className="h-2" />
    </div>
  );
}
