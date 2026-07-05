import { useEffect, useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Progress } from "../ui/progress";
import { Loader2 } from "lucide-react";

const STEPS = [
  "Detecting leaf...",
  "Splitting image into patches...",
  "Calculating healthy area...",
  "Estimating severity...",
];

export function DetectionLoading() {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(8);

  useEffect(() => {
    const stepDuration = 700;

    const stepInterval = setInterval(() => {
      setStepIndex((prev) => {
        if (prev < STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, stepDuration);

    // Progress bar fills smoothly from 8 → 90
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 90) return prev + 2;
        return prev;
      });
    }, 80);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-12 space-y-6">
          {/* Spinner */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-green-600 dark:text-green-400" />
              </div>
              {/* Pulsing ring */}
              <span className="absolute inset-0 rounded-full animate-ping bg-green-500/20" />
            </div>
          </div>

          {/* Title */}
          <div>
            <p className="font-semibold text-lg">Analyzing Leaf Health...</p>
            {/* Step subtitle — fades between steps */}
            <p
              key={stepIndex}
              className="text-sm text-muted-foreground mt-1 transition-opacity duration-300"
            >
              {STEPS[stepIndex]}
            </p>
          </div>

          {/* Step indicators */}
          <div className="flex justify-center gap-2">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i <= stepIndex
                    ? "w-6 bg-green-500"
                    : "w-2 bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Progress bar */}
          <Progress value={progress} className="w-64 mx-auto" />
        </div>
      </CardContent>
    </Card>
  );
}
