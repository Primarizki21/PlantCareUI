import { API_URL } from "../config/api";
import type { DetectionResult } from "../types/detection";

// Helper to convert base64 data URLs to Blobs for multipart/form-data upload
function dataURLtoBlob(dataurl: string): Blob {
  const arr = dataurl.split(",");
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Sends the image to the FastAPI backend for leaf validation and patch classification.
 */
export async function predict(
  imageSource: string | File,
  plantName = "Unknown"
): Promise<DetectionResult> {
  const formData = new FormData();
  
  if (typeof imageSource === "string") {
    // Convert base64 data URL to Blob
    const blob = dataURLtoBlob(imageSource);
    formData.append("file", blob, "uploaded_image.jpg");
  } else {
    formData.append("file", imageSource);
  }
  
  formData.append("plant_name", plantName);

  const response = await fetch(`${API_URL}/api/predict`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to analyze leaf health on the backend.");
  }

  return response.json() as Promise<DetectionResult>;
}

/**
 * Validates whether the uploaded image is a leaf (Model 1 inference only).
 */
export async function validateLeaf(
  imageSource: string | File
): Promise<{ is_leaf: boolean; confidence: number; message: string }> {
  const formData = new FormData();
  
  if (typeof imageSource === "string") {
    const blob = dataURLtoBlob(imageSource);
    formData.append("file", blob, "uploaded_image.jpg");
  } else {
    formData.append("file", imageSource);
  }

  const response = await fetch(`${API_URL}/api/validate-leaf`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to validate image.");
  }

  return response.json() as Promise<{ is_leaf: boolean; confidence: number; message: string }>;
}

/**
 * Future-ready history endpoint.
 */
export async function getHistory(): Promise<any[]> {
  try {
    const response = await fetch(`${API_URL}/api/history`);
    if (response.ok) {
      return response.json();
    }
  } catch (e) {
    console.warn("History API failed, falling back to local list:", e);
  }
  return [];
}
export type { Patch, PatchStatus, Severity, DetectionResult, PatchSummaryData } from "../types/detection";
