import type { Patch, PatchStatus } from "../../services/detectionApi";

interface PatchTooltipContentProps {
  patch: Patch;
}

function getStatusLabel(status: PatchStatus): string {
  switch (status) {
    case "healthy":
      return "Healthy";
    case "unhealthy":
      return "Unhealthy";
    default:
      return "Unknown";
  }
}

export function PatchTooltipContent({ patch }: PatchTooltipContentProps) {
  const label = getStatusLabel(patch.status);
  
  // If confidence is already a percentage (e.g. 98.3), don't multiply. If it's a fraction (0.983), multiply by 100.
  const confidencePct = (patch.confidence <= 1.0 ? patch.confidence * 100 : patch.confidence).toFixed(1);

  return (
    <div className="text-xs leading-snug space-y-0.5 text-left">
      <p className="font-semibold">Patch {patch.id}</p>
      <p>
        <span className="text-primary-foreground/70">Prediction: </span>
        <span className={patch.status === "healthy" ? "text-green-400 font-medium" : "text-red-400 font-medium"}>
          {label}
        </span>
      </p>
      <p>
        <span className="text-primary-foreground/70">Confidence: </span>
        {confidencePct}%
      </p>
    </div>
  );
}
