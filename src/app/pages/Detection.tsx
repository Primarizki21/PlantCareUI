import { useState, useRef, useCallback } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Upload,
  Camera,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Info,
  TrendingUp,
  TrendingDown,
  Activity,
  Download,
} from "lucide-react";
import { Link } from "react-router";

const PLANT_OPTIONS = [
  "Rice",
  "Maize",
  "Oil Palm",
  "Coffee",
  "Cocoa",
  "Coconut",
  "Banana",
  "Mango",
  "Chili Pepper",
  "Cassava",
  "Other",
];

interface DetectionResult {
  isHealthy: boolean;
  plantName: string;
  confidence: number;
  healthScore: number;
  healthyArea: number;
  unhealthyArea: number;
  severity: "None" | "Low" | "Medium" | "High" | "Critical";
  timestamp: number;
}

export function Detection() {
  const [selectedPlant, setSelectedPlant] = useState<string>("Other");
  const [customPlantName, setCustomPlantName] = useState<string>("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!uploadedImage) return;

    setIsAnalyzing(true);
    setResult(null);

    await new Promise((resolve) => setTimeout(resolve, 2500));

    const isHealthy = Math.random() > 0.4;
    const displayName =
      selectedPlant === "Other"
        ? customPlantName.trim() || "Other"
        : selectedPlant;

    let mockResult: DetectionResult;

    if (isHealthy) {
      mockResult = {
        isHealthy: true,
        plantName: displayName,
        confidence: 92 + Math.random() * 7,
        healthScore: 92 + Math.random() * 8,
        healthyArea: 96 + Math.random() * 4,
        unhealthyArea: Math.random() * 4,
        severity: "None",
        timestamp: Date.now(),
      };
    } else {
      const severities: DetectionResult["severity"][] = ["Low", "Medium", "High", "Critical"];
      const severity = severities[Math.floor(Math.random() * severities.length)];
      const healthyArea = 30 + Math.random() * 50;
      mockResult = {
        isHealthy: false,
        plantName: displayName,
        confidence: 82 + Math.random() * 15,
        healthScore: 25 + Math.random() * 45,
        healthyArea,
        unhealthyArea: 100 - healthyArea,
        severity,
        timestamp: Date.now(),
      };
    }

    setResult(mockResult);
    setIsAnalyzing(false);
  };

  const resetDetection = () => {
    setUploadedImage(null);
    setResult(null);
    setSelectedPlant("Other");
    setCustomPlantName("");
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "None":   return "bg-green-500";
      case "Low":    return "bg-yellow-500";
      case "Medium": return "bg-orange-500";
      case "High":   return "bg-red-500";
      case "Critical": return "bg-red-700";
      default:       return "bg-gray-500";
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getSeverityProgress = (severity: string) => {
    switch (severity) {
      case "Low":      return 25;
      case "Medium":   return 50;
      case "High":     return 75;
      case "Critical": return 100;
      default:         return 0;
    }
  };

  return (
    <div className="container px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Leaf Health Assessment</h1>
        <p className="text-muted-foreground">
          Upload a leaf image to analyze leaf patch health, estimate healthy area percentage, and determine severity level.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Plant Image</CardTitle>
              <CardDescription>
                Take a clear photo of the leaf for accurate patch analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Plant Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Plant Type (Optional)</label>
                <Select value={selectedPlant} onValueChange={setSelectedPlant}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select plant type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PLANT_OPTIONS.map((plant) => (
                      <SelectItem key={plant} value={plant}>
                        {plant}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedPlant === "Other" && (
                  <Input
                    value={customPlantName}
                    onChange={(e) => setCustomPlantName(e.target.value)}
                    placeholder="Enter plant name (optional)"
                  />
                )}
              </div>

              {/* Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                    : "border-border hover:border-green-500/50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileInput}
                />

                {uploadedImage ? (
                  <div className="space-y-4">
                    <img
                      src={uploadedImage}
                      alt="Uploaded leaf"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                    >
                      Choose Different Image
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <Upload className="h-8 w-8 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                    <div>
                      <p className="text-lg font-medium mb-1">Drag and drop your image here</p>
                      <p className="text-sm text-muted-foreground">or click to browse from your device</p>
                    </div>
                    <div className="flex gap-2 justify-center">
                      <Button onClick={() => fileInputRef.current?.click()}>
                        <Upload className="mr-2 h-4 w-4" />
                        Browse Files
                      </Button>
                      <Button variant="outline">
                        <Camera className="mr-2 h-4 w-4" />
                        Take Photo
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {uploadedImage && !result && (
                <Button
                  onClick={analyzeImage}
                  disabled={isAnalyzing}
                  className="w-full"
                  size="lg"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing Leaf Patches...
                    </>
                  ) : (
                    <>
                      <Activity className="mr-2 h-4 w-4" />
                      Analyze Leaf Health
                    </>
                  )}
                </Button>
              )}

              {result && (
                <div className="flex gap-2">
                  <Button onClick={analyzeImage} disabled={isAnalyzing} className="flex-1">
                    Analyze Again
                  </Button>
                  <Button onClick={resetDetection} variant="outline" className="flex-1">
                    New Upload
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tips Card */}
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

        {/* Results Section */}
        <div>
          {isAnalyzing && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12 space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto" />
                  <div>
                    <p className="font-semibold text-lg">Analyzing Leaf Patches...</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Our AI is classifying healthy and unhealthy leaf areas
                    </p>
                  </div>
                  <Progress value={66} className="w-64 mx-auto" />
                </div>
              </CardContent>
            </Card>
          )}

          {result && !isAnalyzing && (
            <div className="space-y-6">
              {/* Main Result Card */}
              <Card className={result.isHealthy ? "border-green-500 border-2" : "border-orange-500 border-2"}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        {result.isHealthy ? (
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
                        Plant Name: <span className="font-medium text-foreground">{result.plantName}</span>
                        {" · "}Confidence: {result.confidence.toFixed(1)}%
                      </CardDescription>
                    </div>
                    <Badge
                      variant={result.isHealthy ? "default" : "destructive"}
                      className="text-sm whitespace-nowrap"
                    >
                      {result.severity}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Status banner */}
                  <div
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 ${
                      result.isHealthy
                        ? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800"
                        : "bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800"
                    }`}
                  >
                    {result.isHealthy ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0" />
                    )}
                    <span className={`font-semibold ${result.isHealthy ? "text-green-700 dark:text-green-400" : "text-orange-700 dark:text-orange-400"}`}>
                      {result.isHealthy ? "Healthy Leaf Patch Detected" : "Unhealthy Leaf Patch Detected"}
                    </span>
                  </div>

                  {/* Overall Health Score */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Overall Health Score</span>
                      <span className={`text-sm font-bold ${getHealthScoreColor(result.healthScore)}`}>
                        {result.healthScore.toFixed(0)}/100
                      </span>
                    </div>
                    <Progress value={result.healthScore} className="h-2" />
                  </div>

                  {/* Leaf Patch Area */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">Healthy Area</span>
                      </div>
                      <p className="text-2xl font-bold text-green-600">
                        {result.healthyArea.toFixed(0)}%
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingDown className="h-4 w-4 text-orange-600" />
                        <span className="text-sm font-medium">Unhealthy Area</span>
                      </div>
                      <p className="text-2xl font-bold text-orange-600">
                        {result.unhealthyArea.toFixed(0)}%
                      </p>
                    </div>
                  </div>

                  {/* Severity Level */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Severity Level</span>
                      <Badge className={`${getSeverityColor(result.severity)} text-white`}>
                        {result.severity}
                      </Badge>
                    </div>
                    <Progress
                      value={getSeverityProgress(result.severity)}
                      className="h-2"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <Link to="/history" className="flex-1">
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="mr-2 h-4 w-4" />
                        Save to History
                      </Button>
                    </Link>
                    <Link to="/library" className="flex-1">
                      <Button variant="outline" className="w-full justify-start">
                        <Info className="mr-2 h-4 w-4" />
                        Plant Library
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {!result && !isAnalyzing && (
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
