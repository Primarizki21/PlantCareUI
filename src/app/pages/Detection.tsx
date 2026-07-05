import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { CheckCircle2, Info, Activity, AlertCircle } from "lucide-react";
import { DetectionUpload } from "../components/detection/DetectionUpload";
import { DetectionLoading } from "../components/detection/DetectionLoading";
import { LeafValidationCard } from "../components/detection/LeafValidationCard";
import { LeafResultCard } from "../components/detection/LeafResultCard";
import * as detectionApi from "../services/detectionApi";
import type { DetectionResult } from "../services/detectionApi";

type PageState = "idle" | "analyzing" | "invalid_leaf" | "result" | "error";

export function Detection() {
  const [selectedPlant, setSelectedPlant] = useState<string>("Other");
  const [customPlantName, setCustomPlantName] = useState<string>("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [pageState, setPageState] = useState<PageState>("idle");
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notLeafMessage, setNotLeafMessage] = useState<string | null>(null);

  const triggerFilePicker = useRef<(() => void) | null>(null);

  const handleFile = useCallback((file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setResult(null);
        setErrorMessage(null);
        setNotLeafMessage(null);
        setPageState("idle");
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const analyzeImage = async () => {
    if (!uploadedImage) return;

    setPageState("analyzing");
    setResult(null);
    setErrorMessage(null);
    setNotLeafMessage(null);

    const plantName =
      selectedPlant === "Other"
        ? customPlantName.trim() || "Unknown"
        : selectedPlant;

    try {
      const data = await detectionApi.predict(uploadedImage, plantName);

      if (!data.is_leaf) {
        setNotLeafMessage(
          data.message ??
            "The uploaded image is not a valid leaf image."
        );
        setPageState("invalid_leaf");
      } else {
        setResult(data);
        setPageState("result");
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to analyze the image. Please try again.";
      setErrorMessage(message);
      setPageState("error");
    }
  };

  const resetDetection = () => {
    setUploadedImage(null);
    setResult(null);
    setSelectedPlant("Other");
    setCustomPlantName("");
    setErrorMessage(null);
    setNotLeafMessage(null);
    setPageState("idle");
  };

  const handleUploadAnother = () => {
    resetDetection();
  };

  const handleChooseDifferent = () => {
    setUploadedImage(null);
    setResult(null);
    setErrorMessage(null);
    setNotLeafMessage(null);
    setPageState("idle");
    triggerFilePicker.current?.();
  };

  const isAnalyzing = pageState === "analyzing";
  const hasResult = pageState === "result";

  return (
    <div className="container px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Leaf Health Assessment</h1>
        <p className="text-muted-foreground">
          Upload a leaf image to analyze leaf patch health, estimate healthy area
          percentage, and determine severity level.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
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
            onRegisterTrigger={(fn) => {
              triggerFilePicker.current = fn;
            }}
          />

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

        <div>
          {pageState === "analyzing" && <DetectionLoading />}

          {pageState === "invalid_leaf" && (
            <LeafValidationCard
              message={notLeafMessage ?? undefined}
              onUploadAnother={handleUploadAnother}
              onChooseDifferent={handleChooseDifferent}
            />
          )}

          {pageState === "error" && (
            <Card className="border-destructive/50 border-2">
              <CardContent className="pt-6">
                <div className="text-center py-12 space-y-4">
                  <AlertCircle className="h-12 w-12 mx-auto text-destructive opacity-80" />
                  <div>
                    <p className="font-semibold text-lg mb-1">Analysis Failed</p>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                      {errorMessage ??
                        "Could not reach the analysis server. Make sure the backend is running on port 8000."}
                    </p>
                  </div>
                  <Button onClick={analyzeImage} disabled={!uploadedImage}>
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {pageState === "result" && result && (
            <LeafResultCard result={result} imageUrl={uploadedImage!} />
          )}

          {pageState === "idle" && (
            <Card className="border-dashed">
              <CardContent className="pt-6">
                <div className="text-center py-12 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium mb-1">No analysis yet</p>
                  <p className="text-sm">
                    Upload a leaf image to see the assessment result
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
