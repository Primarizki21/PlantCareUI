import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { CheckCircle2, Info, Activity } from "lucide-react";
import { DetectionUpload } from "../components/detection/DetectionUpload";
import { DetectionLoading } from "../components/detection/DetectionLoading";
import { LeafValidationCard } from "../components/detection/LeafValidationCard";
import { LeafResultCard } from "../components/detection/LeafResultCard";
import * as detectionApi from "../services/detectionApi";
import type { DetectionResult } from "../services/detectionApi";

type PageState = "idle" | "analyzing" | "invalid_leaf" | "result";

export function Detection() {
  const [selectedPlant, setSelectedPlant] = useState<string>("Other");
  const [customPlantName, setCustomPlantName] = useState<string>("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [pageState, setPageState] = useState<PageState>("idle");
  const [result, setResult] = useState<DetectionResult | null>(null);

  // Callback ref — DetectionUpload stores its file picker trigger here so the
  // parent can open the picker from outside (e.g. after leaf validation fails)
  const triggerFilePicker = useRef<(() => void) | null>(null);

  // ── File handling ─────────────────────────────────────────────────────────

  const handleFile = useCallback((file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setResult(null);
        setPageState("idle");
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // ── Analysis ──────────────────────────────────────────────────────────────

  const analyzeImage = async () => {
    if (!uploadedImage) return;

    setPageState("analyzing");
    setResult(null);

    const plantName =
      selectedPlant === "Other"
        ? customPlantName.trim() || "Unknown"
        : selectedPlant;

    const data = await detectionApi.predict(uploadedImage, plantName);

    if (!data.is_leaf) {
      setPageState("invalid_leaf");
    } else {
      setResult(data);
      setPageState("result");
    }
  };

  // ── Reset helpers ─────────────────────────────────────────────────────────

  const resetDetection = () => {
    setUploadedImage(null);
    setResult(null);
    setSelectedPlant("Other");
    setCustomPlantName("");
    setPageState("idle");
  };

  // When the leaf validation fails, the user may want to upload a brand-new
  // image (clear everything) or just pick a different file (keep the form).
  const handleUploadAnother = () => {
    resetDetection();
  };

  const handleChooseDifferent = () => {
    // Keep plant selection; only clear the image
    setUploadedImage(null);
    setResult(null);
    setPageState("idle");
    // Open the file picker that lives inside DetectionUpload
    triggerFilePicker.current?.();
  };

  // ── Derived flags ─────────────────────────────────────────────────────────

  const isAnalyzing = pageState === "analyzing";
  const hasResult = pageState === "result";

  return (
    <div className="container px-4 py-8 max-w-7xl">
      {/* Page heading */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Leaf Health Assessment</h1>
        <p className="text-muted-foreground">
          Upload a leaf image to analyze leaf patch health, estimate healthy area
          percentage, and determine severity level.
        </p>
      </div>

      {/* Two-column layout — stacks on mobile/tablet */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* ── Left: Upload Panel ── */}
        <div className="space-y-6">
          <DetectionUpload
            selectedPlant={selectedPlant}
            customPlantName={customPlantName}
            uploadedImage={uploadedImage}
            isAnalyzing={isAnalyzing}
            hasResult={hasResult}
            onPlantChange={setSelectedPlant}
            onCustomPlantChange={setCustomPlantName}
            onFile={handleFile}
            onAnalyze={analyzeImage}
            onReset={resetDetection}
            onRegisterTrigger={(fn) => { triggerFilePicker.current = fn; }}
          />

          {/* Tips Card — preserved from original */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="h-5 w-5" />
                Tips for Best Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Take photos in good natural lighting</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Ensure the leaf fills most of the frame</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Capture both healthy and unhealthy patches in one shot</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Avoid blurry or out-of-focus images</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* ── Right: Results Panel ── */}
        <div>
          {/* Loading state */}
          {pageState === "analyzing" && <DetectionLoading />}

          {/* Leaf validation failed */}
          {pageState === "invalid_leaf" && (
            <LeafValidationCard
              onUploadAnother={handleUploadAnother}
              onChooseDifferent={handleChooseDifferent}
            />
          )}

          {/* Analysis result */}
          {pageState === "result" && result && (
            <LeafResultCard result={result} imageUrl={uploadedImage!} />
          )}

          {/* Idle / no image yet */}
          {pageState === "idle" && (
            <Card className="border-dashed">
              <CardContent className="pt-6">
                <div className="text-center py-12 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium mb-1">No analysis yet</p>
                  <p className="text-sm">Upload a leaf image to see the assessment result</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
