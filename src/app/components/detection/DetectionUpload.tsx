import { useCallback, useRef, useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Upload, Camera, Loader2, Activity } from "lucide-react";
import { CameraCapture } from "./CameraCapture";

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

interface DetectionUploadProps {
  selectedPlant: string;
  customPlantName: string;
  uploadedImage: string | null;
  isAnalyzing: boolean;
  hasResult: boolean;
  onPlantChange: (value: string) => void;
  onCustomPlantChange: (value: string) => void;
  onFile: (file: File) => void;
  onAnalyze: () => void;
  onReset: () => void;
  /** Parent stores this so it can open the file picker from outside the component */
  onRegisterTrigger?: (trigger: () => void) => void;
}

export function DetectionUpload({
  selectedPlant,
  customPlantName,
  uploadedImage,
  isAnalyzing,
  hasResult,
  onPlantChange,
  onCustomPlantChange,
  onFile,
  onAnalyze,
  onReset,
  onRegisterTrigger,
}: DetectionUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cameraOpen, setCameraOpen] = useState(false);

  // Register the file picker trigger with the parent on mount
  useEffect(() => {
    onRegisterTrigger?.(() => fileInputRef.current?.click());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer.files?.[0]) {
        onFile(e.dataTransfer.files[0]);
      }
    },
    [onFile]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      onFile(e.target.files[0]);
    }
  };

  return (
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
          <Select value={selectedPlant} onValueChange={onPlantChange}>
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
              onChange={(e) => onCustomPlantChange(e.target.value)}
              placeholder="Enter plant name (optional)"
            />
          )}
        </div>

        {/* Upload Area */}
        <div
          className="border-2 border-dashed rounded-lg p-8 text-center transition-colors border-border hover:border-green-500/50"
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

          {cameraOpen ? (
            <CameraCapture
              onCapture={(file) => {
                setCameraOpen(false);
                onFile(file);
              }}
              onCancel={() => setCameraOpen(false)}
            />
          ) : uploadedImage ? (
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
                <Button variant="outline" onClick={() => setCameraOpen(true)}>
                  <Camera className="mr-2 h-4 w-4" />
                  Take Photo
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {uploadedImage && !hasResult && (
          <Button
            onClick={onAnalyze}
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

        {hasResult && (
          <div className="flex gap-2">
            <Button onClick={onAnalyze} disabled={isAnalyzing} className="flex-1">
              Analyze Again
            </Button>
            <Button onClick={onReset} variant="outline" className="flex-1">
              New Upload
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
