import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import type { Severity } from "../../services/detectionApi";

interface SeverityCardProps {
  severity: Severity;
}

function getSeverityColor(severity: Severity): string {
  switch (severity) {
    case "None":   return "bg-green-500";
    case "Low":    return "bg-yellow-500";
    case "Medium": return "bg-orange-500";
    case "High":   return "bg-red-500";
    default:       return "bg-gray-500";
  }
}

function getSeverityProgress(severity: Severity): number {
  switch (severity) {
    case "None":   return 0;
    case "Low":    return 25;
    case "Medium": return 50;
    case "High":   return 100;
    default:       return 0;
  }
}

export function SeverityCard({ severity }: SeverityCardProps) {
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Severity Level</span>
        <Badge className={`${getSeverityColor(severity)} text-white`}>
          {severity}
        </Badge>
      </div>
      <Progress value={getSeverityProgress(severity)} className="h-2" />
    </div>
  );
}
