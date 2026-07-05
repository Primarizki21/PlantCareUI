import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { AlertTriangle } from "lucide-react";

interface LeafValidationCardProps {
  onUploadAnother: () => void;
  onChooseDifferent: () => void;
}

export function LeafValidationCard({
  onUploadAnother,
  onChooseDifferent,
}: LeafValidationCardProps) {
  return (
    <Card className="border-orange-400/60 border-2">
      <CardContent className="pt-6">
        <div className="py-8 space-y-6 text-center">
          {/* Illustration placeholder */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                {/* Simple leaf-with-X SVG illustration */}
                <svg
                  viewBox="0 0 64 64"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-14 w-14"
                  aria-label="No leaf detected illustration"
                >
                  {/* Leaf shape */}
                  <path
                    d="M32 8 C48 8 56 20 56 32 C56 44 48 56 32 56 C16 56 8 44 8 32 C8 20 16 8 32 8Z"
                    fill="currentColor"
                    className="text-orange-200 dark:text-orange-800/50"
                  />
                  <path
                    d="M32 12 C46 12 52 22 52 32 C52 42 46 52 32 52"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="text-orange-400 dark:text-orange-500"
                    fill="none"
                  />
                  {/* Centre vein */}
                  <line
                    x1="32"
                    y1="14"
                    x2="32"
                    y2="50"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    className="text-orange-400 dark:text-orange-500"
                  />
                  {/* X mark */}
                  <line
                    x1="22"
                    y1="22"
                    x2="42"
                    y2="42"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="text-orange-500 dark:text-orange-400"
                  />
                  <line
                    x1="42"
                    y1="22"
                    x2="22"
                    y2="42"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="text-orange-500 dark:text-orange-400"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Warning icon + title */}
          <div className="space-y-2">
            <div className="flex justify-center">
              <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-semibold text-lg">Image Validation Failed</span>
              </div>
            </div>

            {/* Message */}
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              The uploaded image does not appear to contain a plant leaf. Please
              upload a clear image of a single leaf for analysis.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={onUploadAnother}
              className="sm:min-w-[160px]"
            >
              Upload Another Image
            </Button>
            <Button
              variant="outline"
              onClick={onChooseDifferent}
              className="sm:min-w-[160px]"
            >
              Choose Different Image
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
