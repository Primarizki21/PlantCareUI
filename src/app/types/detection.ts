export type PatchStatus = "healthy" | "unhealthy";

export type Severity = "None" | "Low" | "Medium" | "High" | "Critical";

export interface Patch {
  id: number;
  x: number; // column index 0-7
  y: number; // row index 0-7
  status: PatchStatus;
  confidence: number; // 0.0 - 1.0 or percentage
}

export interface PatchSummaryData {
  healthy_patches: number;
  unhealthy_patches: number;
  total_patches: number;
  healthy_area: number; // percentage
  unhealthy_area: number; // percentage
  average_confidence: number;
}

export interface DetectionResult {
  is_leaf: boolean;
  plant_name: string;
  confidence: number; // percentage
  health_score: number; // percentage
  healthy_percentage: number; // percentage
  unhealthy_percentage: number; // percentage
  severity: Severity;
  patches: Patch[];
  patch_summary: PatchSummaryData;
}
