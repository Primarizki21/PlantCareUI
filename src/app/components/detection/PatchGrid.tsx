import { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { PatchTooltipContent } from "./PatchTooltip";
import type { Patch, PatchStatus } from "../../services/detectionApi";

interface PatchGridProps {
  imageUrl: string;
  patches: Patch[];
}

function getPatchColor(status: PatchStatus): string {
  switch (status) {
    case "healthy":
      return "bg-green-500/40 hover:bg-green-500/60 border-green-600/50";
    case "unhealthy":
      return "bg-red-500/55 hover:bg-red-500/75 border-red-600/60";
    default:
      return "bg-gray-400/40 hover:bg-gray-400/60 border-gray-500/50";
  }
}

export function PatchGrid({ imageUrl, patches }: PatchGridProps) {
  const [focusedId, setFocusedId] = useState<number | null>(null);

  if (patches.length === 0) return null;

  const cols = 8;
  const rows = 8;

  const patchMap = new Map<string, Patch>(
    patches.map((p) => [`${p.x},${p.y}`, p])
  );

  return (
    <div className="space-y-3">
      <div className="flex justify-center">
        <div className="relative inline-block max-h-[min(380px,70vh)] rounded-lg overflow-hidden border border-border bg-black">
          <img
            src={imageUrl}
            alt="Leaf with patch overlay"
            className="block max-w-full max-h-[min(380px,70vh)] w-auto h-auto"
          />

          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden
          >
            <div
              className="grid h-full w-full pointer-events-auto"
              style={{
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gridTemplateRows: `repeat(${rows}, 1fr)`,
              }}
            >
              {Array.from({ length: rows }).map((_, row) =>
                Array.from({ length: cols }).map((_, col) => {
                  const patch = patchMap.get(`${col},${row}`);
                  if (!patch) {
                    return (
                      <div
                        key={`${col}-${row}`}
                        className="border border-dashed border-white/30 bg-white/[0.03]"
                        aria-label="Skipped patch (no leaf content)"
                      />
                    );
                  }

                const isFocused = focusedId === patch.id;

                return (
                  <Tooltip key={patch.id}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        aria-label={`Patch ${patch.id}`}
                        className={`
                          border transition-all duration-150 cursor-pointer outline-none
                          ${getPatchColor(patch.status)}
                          ${isFocused ? "ring-2 ring-white ring-inset" : ""}
                        `}
                        onFocus={() => setFocusedId(patch.id)}
                        onBlur={() => setFocusedId(null)}
                        onClick={() =>
                          setFocusedId((prev) =>
                            prev === patch.id ? null : patch.id
                          )
                        }
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={4}>
                      <PatchTooltipContent patch={patch} />
                    </TooltipContent>
                  </Tooltip>
                );
              })
            )}
          </div>
        </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-green-500/60 inline-block" />
          Healthy Patch
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-red-500/65 inline-block" />
          Unhealthy Patch
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm border border-dashed border-white/40 bg-white/[0.03] inline-block" />
          Skipped (no leaf)
        </span>
      </div>
    </div>
  );
}
