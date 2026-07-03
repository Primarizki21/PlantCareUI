// Mock scan history data — Leaf Health Assessment System

export interface ScanResult {
  id: string;
  date: string;
  timestamp: number;
  plantType: string;
  /** The user-provided plant name. Same as plantType unless the user typed a custom name. */
  plantName: string;
  isHealthy: boolean;
  confidence: number;
  healthScore: number;
  healthyArea: number;
  unhealthyArea: number;
  severity: "None" | "Low" | "Medium" | "High" | "Critical";
  imageUrl?: string;
  notes?: string;
}

export const mockScans: ScanResult[] = [
  {
    id: "scan_001",
    date: "2026-07-02",
    timestamp: Date.now() - 1000 * 60 * 30,
    plantType: "Rice",
    plantName: "Rice",
    isHealthy: false,
    confidence: 94.5,
    healthScore: 42,
    healthyArea: 65,
    unhealthyArea: 35,
    severity: "Medium",
    notes: "Unhealthy patches detected on lower leaves",
  },
  {
    id: "scan_002",
    date: "2026-07-02",
    timestamp: Date.now() - 1000 * 60 * 60 * 2,
    plantType: "Rice",
    plantName: "Rice",
    isHealthy: true,
    confidence: 97.2,
    healthScore: 98,
    healthyArea: 99,
    unhealthyArea: 1,
    severity: "None",
  },
  {
    id: "scan_003",
    date: "2026-07-01",
    timestamp: Date.now() - 1000 * 60 * 60 * 24,
    plantType: "Maize",
    plantName: "Maize",
    isHealthy: false,
    confidence: 96.8,
    healthScore: 28,
    healthyArea: 45,
    unhealthyArea: 55,
    severity: "Critical",
    notes: "Large unhealthy patch area — urgent attention required",
  },
  {
    id: "scan_004",
    date: "2026-07-01",
    timestamp: Date.now() - 1000 * 60 * 60 * 26,
    plantType: "Mango",
    plantName: "Mango",
    isHealthy: false,
    confidence: 91.3,
    healthScore: 58,
    healthyArea: 72,
    unhealthyArea: 28,
    severity: "High",
  },
  {
    id: "scan_005",
    date: "2026-06-30",
    timestamp: Date.now() - 1000 * 60 * 60 * 48,
    plantType: "Maize",
    plantName: "Maize",
    isHealthy: true,
    confidence: 95.4,
    healthScore: 96,
    healthyArea: 98,
    unhealthyArea: 2,
    severity: "None",
  },
  {
    id: "scan_006",
    date: "2026-06-30",
    timestamp: Date.now() - 1000 * 60 * 60 * 50,
    plantType: "Banana",
    plantName: "Banana",
    isHealthy: false,
    confidence: 89.7,
    healthScore: 51,
    healthyArea: 68,
    unhealthyArea: 32,
    severity: "High",
  },
  {
    id: "scan_007",
    date: "2026-06-29",
    timestamp: Date.now() - 1000 * 60 * 60 * 72,
    plantType: "Chili Pepper",
    plantName: "Chili Pepper",
    isHealthy: false,
    confidence: 93.1,
    healthScore: 47,
    healthyArea: 61,
    unhealthyArea: 39,
    severity: "High",
  },
  {
    id: "scan_008",
    date: "2026-06-29",
    timestamp: Date.now() - 1000 * 60 * 60 * 74,
    plantType: "Coconut",
    plantName: "Coconut",
    isHealthy: true,
    confidence: 96.8,
    healthScore: 97,
    healthyArea: 99,
    unhealthyArea: 1,
    severity: "None",
  },
  {
    id: "scan_009",
    date: "2026-06-28",
    timestamp: Date.now() - 1000 * 60 * 60 * 96,
    plantType: "Coffee",
    plantName: "Coffee",
    isHealthy: false,
    confidence: 88.9,
    healthScore: 61,
    healthyArea: 74,
    unhealthyArea: 26,
    severity: "Medium",
  },
  {
    id: "scan_010",
    date: "2026-06-28",
    timestamp: Date.now() - 1000 * 60 * 60 * 98,
    plantType: "Oil Palm",
    plantName: "Oil Palm",
    isHealthy: true,
    confidence: 94.2,
    healthScore: 95,
    healthyArea: 97,
    unhealthyArea: 3,
    severity: "None",
  },
  {
    id: "scan_011",
    date: "2026-06-27",
    timestamp: Date.now() - 1000 * 60 * 60 * 120,
    plantType: "Cassava",
    plantName: "Cassava",
    isHealthy: false,
    confidence: 92.4,
    healthScore: 54,
    healthyArea: 69,
    unhealthyArea: 31,
    severity: "Medium",
  },
  {
    id: "scan_012",
    date: "2026-06-27",
    timestamp: Date.now() - 1000 * 60 * 60 * 122,
    plantType: "Cocoa",
    plantName: "Cocoa",
    isHealthy: false,
    confidence: 90.6,
    healthScore: 63,
    healthyArea: 76,
    unhealthyArea: 24,
    severity: "Medium",
  },
  {
    id: "scan_013",
    date: "2026-06-26",
    timestamp: Date.now() - 1000 * 60 * 60 * 144,
    plantType: "Mango",
    plantName: "Mango",
    isHealthy: true,
    confidence: 95.7,
    healthScore: 96,
    healthyArea: 98,
    unhealthyArea: 2,
    severity: "None",
  },
  {
    id: "scan_014",
    date: "2026-06-26",
    timestamp: Date.now() - 1000 * 60 * 60 * 146,
    plantType: "Rice",
    plantName: "Rice",
    isHealthy: false,
    confidence: 93.8,
    healthScore: 44,
    healthyArea: 63,
    unhealthyArea: 37,
    severity: "High",
  },
  {
    id: "scan_015",
    date: "2026-06-25",
    timestamp: Date.now() - 1000 * 60 * 60 * 168,
    plantType: "Banana",
    plantName: "Banana",
    isHealthy: true,
    confidence: 96.1,
    healthScore: 97,
    healthyArea: 99,
    unhealthyArea: 1,
    severity: "None",
  },
];

export function getPlantTypeDistribution() {
  const distribution: { [key: string]: number } = {};
  mockScans.forEach((scan) => {
    distribution[scan.plantType] = (distribution[scan.plantType] || 0) + 1;
  });
  return Object.entries(distribution).map(([name, value]) => ({ name, value }));
}

export function getHealthyVsUnhealthy() {
  const healthy = mockScans.filter((s) => s.isHealthy).length;
  const unhealthy = mockScans.filter((s) => !s.isHealthy).length;
  return [
    { name: "Healthy", value: healthy },
    { name: "Unhealthy", value: unhealthy },
  ];
}

/** @deprecated use getHealthyVsUnhealthy */
export function getHealthyVsDiseased() {
  return getHealthyVsUnhealthy();
}

export function getAverageConfidence() {
  const total = mockScans.reduce((sum, scan) => sum + scan.confidence, 0);
  return (total / mockScans.length).toFixed(1);
}

export function getScansByDateRange(days: number = 7) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return mockScans.filter((scan) => scan.timestamp >= cutoff);
}

export function getSeverityDistribution() {
  const dist: { [key: string]: number } = { None: 0, Low: 0, Medium: 0, High: 0, Critical: 0 };
  mockScans.forEach((s) => { dist[s.severity] = (dist[s.severity] || 0) + 1; });
  return Object.entries(dist).map(([name, count]) => ({ name, count }));
}
