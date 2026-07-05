import type { DetectionResult } from "../types/detection";

export interface ScanRecord {
  id: string;
  date: string;
  timestamp: number;
  plantType: string;
  plantName: string;
  isHealthy: boolean;
  confidence: number;
  healthScore: number;
  healthyArea: number;
  unhealthyArea: number;
  severity: DetectionResult["severity"];
  notes?: string;
}

const STORAGE_KEY = "plantcare_scan_history";
const MAX_RECORDS = 100;

function readAll(): ScanRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const cleaned = parsed.map((r: any) => {
      const { imageUrl, ...rest } = r;
      return rest as ScanRecord;
    });
    if (cleaned.some((r, i) => "imageUrl" in parsed[i])) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned)); } catch {}
    }
    return cleaned;
  } catch {
    return [];
  }
}

function writeAll(records: ScanRecord[]): void {
  const trimmed = records.length > MAX_RECORDS
    ? records.slice(0, MAX_RECORDS)
    : records;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export function getScans(): ScanRecord[] {
  return readAll().sort((a, b) => b.timestamp - a.timestamp);
}

export function saveScan(
  result: DetectionResult,
  notes?: string
): ScanRecord {
  const plantName = result.plant_name || "Unknown";
  const record: ScanRecord = {
    id: `scan_${Date.now()}`,
    date: new Date().toISOString().slice(0, 10),
    timestamp: Date.now(),
    plantType: plantName,
    plantName,
    isHealthy: result.health_score >= 70,
    confidence: result.confidence,
    healthScore: result.health_score,
    healthyArea: result.healthy_percentage,
    unhealthyArea: result.unhealthy_percentage,
    severity: result.severity,
    notes,
  };

  writeAll([record, ...readAll()]);
  return record;
}

export function getPlantTypeDistribution(scans: ScanRecord[] = getScans()) {
  const distribution: Record<string, number> = {};
  scans.forEach((scan) => {
    distribution[scan.plantType] = (distribution[scan.plantType] || 0) + 1;
  });
  return Object.entries(distribution).map(([name, value]) => ({ name, value }));
}

export function getHealthyVsUnhealthy(scans: ScanRecord[] = getScans()) {
  const healthy = scans.filter((s) => s.isHealthy).length;
  const unhealthy = scans.filter((s) => !s.isHealthy).length;
  return [
    { name: "Healthy", value: healthy },
    { name: "Unhealthy", value: unhealthy },
  ];
}

export function getAverageConfidence(scans: ScanRecord[] = getScans()): string {
  if (scans.length === 0) return "0.0";
  const total = scans.reduce((sum, scan) => sum + scan.confidence, 0);
  return (total / scans.length).toFixed(1);
}

export function getScansByDateRange(days = 7, scans: ScanRecord[] = getScans()) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return scans.filter((scan) => scan.timestamp >= cutoff);
}

export function getSeverityDistribution(scans: ScanRecord[] = getScans()) {
  const dist: Record<string, number> = {
    None: 0,
    Low: 0,
    Medium: 0,
    High: 0,
    Critical: 0,
  };
  scans.forEach((s) => {
    dist[s.severity] = (dist[s.severity] || 0) + 1;
  });
  return Object.entries(dist).map(([name, count]) => ({ name, count }));
}
