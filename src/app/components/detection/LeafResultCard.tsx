import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import {
  CheckCircle2,
  AlertCircle,
  Download,
  Info,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { saveScan } from "../../services/scanHistory";
import { HealthScoreCard } from "./HealthScoreCard";
import { SeverityCard } from "./SeverityCard";
import { PatchGrid } from "./PatchGrid";
import { PatchSummary } from "./PatchSummary";
import type { DetectionResult } from "../../services/detectionApi";

interface LeafResultCardProps {
  result: DetectionResult;
  imageUrl: string;
}

export function LeafResultCard({ result, imageUrl }: LeafResultCardProps) {
  const isHealthy = result.health_score >= 70;
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    saveScan(result);
    setSaved(true);
    toast.success("Scan saved to history");
  };

  return (
    <div className="space-y-6">
      {/* ── Main Assessment Card ── */}
      <Card className={isHealthy ? "border-green-500 border-2" : "border-orange-500 border-2"}>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                {isHealthy ? (
                  <>
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                    Leaf Health Assessment Result
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-6 w-6 text-orange-600" />
                    Leaf Health Assessment Result
                  </>
                )}
              </CardTitle>
              <CardDescription className="mt-1.5">
                {result.plant_name !== "Unknown" && result.plant_name !== "Other" && (
                  <>
                    Plant: <span className="font-medium text-foreground">{result.plant_name}</span>
                    {" · "}
                  </>
                )}
                Confidence: {result.confidence.toFixed(1)}%
              </CardDescription>
            </div>
            <Badge
              variant={isHealthy ? "default" : "destructive"}
              className="text-sm whitespace-nowrap"
            >
              {result.severity}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Status Banner */}
          <div
            className={`flex items-center gap-3 rounded-lg px-4 py-3 ${
              isHealthy
                ? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800"
                : "bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800"
            }`}
          >
            {isHealthy ? (
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0" />
            )}
            <span
              className={`font-semibold ${
                isHealthy
                  ? "text-green-700 dark:text-green-400"
                  : "text-orange-700 dark:text-orange-400"
              }`}
            >
              {isHealthy ? "Healthy Leaf Patch Detected" : "Unhealthy Leaf Patch Detected"}
            </span>
          </div>

          {/* Health Score */}
          <HealthScoreCard healthScore={result.health_score} />

          {/* Healthy / Affected Area */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Healthy Area</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {result.healthy_percentage.toFixed(0)}%
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Affected Area</span>
              </div>
              <p className="text-2xl font-bold text-orange-600">
                {result.unhealthy_percentage.toFixed(0)}%
              </p>
            </div>
          </div>

          {/* Severity */}
          <SeverityCard severity={result.severity} unhealthyPercentage={result.unhealthy_percentage} />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <Button
              variant="outline"
              className="flex-1 justify-start"
              onClick={handleSave}
              disabled={saved}
            >
              <Download className="mr-2 h-4 w-4" />
              {saved ? "Saved to History" : "Save to History"}
            </Button>
            <Link to="/history" className="flex-1">
              <Button variant="outline" className="w-full justify-start">
                <Info className="mr-2 h-4 w-4" />
                View History
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* ── Patch Analysis Section ── */}
      {result.patches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Leaf Patch Analysis</CardTitle>
            <CardDescription>
              Click or hover any patch cell to view its prediction and confidence score.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <PatchGrid imageUrl={imageUrl} patches={result.patches} />
            <Separator />
            <PatchSummary summary={result.patch_summary} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
