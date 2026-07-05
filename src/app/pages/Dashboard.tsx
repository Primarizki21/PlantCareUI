import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  getScans,
  getPlantTypeDistribution,
  getHealthyVsUnhealthy,
  getAverageConfidence,
  getSeverityDistribution,
} from "../services/scanHistory";
import { Link } from "react-router";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Leaf,
  AlertTriangle,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

type Range = "7d" | "30d" | "90d" | "all";
const DAY_MS = 24 * 60 * 60 * 1000;
const RANGE_DAYS: Record<Range, number | null> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "all": null,
};

export function Dashboard() {
  const [range, setRange] = useState<Range>("7d");
  const rangeDays = RANGE_DAYS[range];

  const scans = getScans();
  const now = Date.now();
  const currentStart = rangeDays ? now - rangeDays * DAY_MS : 0;
  const previousStart = rangeDays ? now - rangeDays * 2 * DAY_MS : 0;
  const currentScans = rangeDays
    ? scans.filter((s) => s.timestamp >= currentStart)
    : scans;
  const previousScans = rangeDays
    ? scans.filter((s) => s.timestamp >= previousStart && s.timestamp < currentStart)
    : [];

  const countHealthy = (xs: typeof scans) => xs.filter((s) => s.isHealthy).length;
  const avgConf = (xs: typeof scans) =>
    xs.length > 0 ? xs.reduce((sum, s) => sum + s.confidence, 0) / xs.length : 0;

  const currentTotal = currentScans.length;
  const currentHealthy = countHealthy(currentScans);
  const currentUnhealthy = currentTotal - currentHealthy;
  const currentAvg = avgConf(currentScans);

  const previousTotal = previousScans.length;
  const previousHealthy = countHealthy(previousScans);
  const previousUnhealthy = previousTotal - previousHealthy;
  const previousAvg = avgConf(previousScans);

  function deltaPct(curr: number, prev: number): number | null {
    if (prev === 0) return null;
    return ((curr - prev) / prev) * 100;
  }

  function fmtDelta(d: number | null): string {
    if (d === null) return "—";
    const sign = d >= 0 ? "+" : "";
    return `${sign}${d.toFixed(1)}%`;
  }

  function trendDir(d: number | null): "up" | "down" | "flat" {
    if (d === null || d === 0) return "flat";
    return d > 0 ? "up" : "down";
  }

  function isImproved(goodWhen: "up" | "down", dir: "up" | "down" | "flat"): boolean {
    if (dir === "flat") return true;
    return goodWhen === "up" ? dir === "up" : dir === "down";
  }

  const deltas = {
    total: deltaPct(currentTotal, previousTotal),
    healthy: deltaPct(currentHealthy, previousHealthy),
    unhealthy: deltaPct(currentUnhealthy, previousUnhealthy),
    avg: deltaPct(currentAvg, previousAvg),
  };

  const healthyVsUnhealthy = getHealthyVsUnhealthy(currentScans);
  const severityDistribution = getSeverityDistribution(currentScans).filter((s) => s.name !== "None");
  const plantTypeDistribution = getPlantTypeDistribution(currentScans);

  const chartDays = rangeDays ? Math.min(rangeDays, 30) : 30;
  const today = new Date();
  const scansPerDay = Array.from({ length: chartDays }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (chartDays - 1 - i));
    const key = format(date, "yyyy-MM-dd");
    const count = currentScans.filter((scan) => {
      return format(new Date(scan.timestamp), "yyyy-MM-dd") === key;
    }).length;
    return { date: format(date, "MMM dd"), scans: count };
  });

  const recentScans = [...currentScans].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);

  const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

  const stats = [
    {
      label: "Total Scans",
      value: currentTotal,
      change: fmtDelta(deltas.total),
      goodWhen: "up" as const,
      icon: Activity,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      label: "Healthy Leaves",
      value: currentHealthy,
      change: fmtDelta(deltas.healthy),
      goodWhen: "up" as const,
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    {
      label: "Unhealthy Leaves",
      value: currentUnhealthy,
      change: fmtDelta(deltas.unhealthy),
      goodWhen: "down" as const,
      icon: AlertTriangle,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
    },
    {
      label: "Avg Confidence",
      value: currentAvg.toFixed(1) + "%",
      change: fmtDelta(deltas.avg),
      goodWhen: "up" as const,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
    },
  ];

  return (
    <div className="container px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Track your leaf health assessment performance and trends
          </p>
        </div>
        <Select value={range} onValueChange={(v) => setRange(v as Range)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const dir = trendDir(
            index === 0 ? deltas.total
              : index === 1 ? deltas.healthy
              : index === 2 ? deltas.unhealthy
              : deltas.avg
          );
          const improved = isImproved(stat.goodWhen, dir);
          return (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold mb-1">{stat.value}</p>
                    <div className="flex items-center gap-1 text-sm">
                      {dir === "up" ? (
                        <TrendingUp className={`h-3 w-3 ${improved ? "text-green-600" : "text-red-600"}`} />
                      ) : dir === "down" ? (
                        <TrendingDown className={`h-3 w-3 ${improved ? "text-green-600" : "text-red-600"}`} />
                      ) : (
                        <span className="h-3 w-3" />
                      )}
                      <span className={improved ? "text-green-600" : "text-red-600"}>
                        {stat.change}
                      </span>
                      <span className="text-muted-foreground">vs previous period</span>
                    </div>
                  </div>
                  <div className={`h-12 w-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Scans Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Scan Activity
            </CardTitle>
            <CardDescription>Number of scans per day (last {chartDays} days)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={scansPerDay}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="scans"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: "#10b981", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Healthy vs Unhealthy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5" />
              Leaf Health Status
            </CardTitle>
            <CardDescription>Distribution of healthy vs unhealthy leaf patches</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={healthyVsUnhealthy}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  dataKey="value"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#f59e0b" />
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Severity Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Severity Distribution
            </CardTitle>
            <CardDescription>Unhealthy scan severity breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={severityDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" />
                <YAxis dataKey="name" type="category" width={70} className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Plant Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Plant Types Scanned
            </CardTitle>
            <CardDescription>Distribution by plant species</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={plantTypeDistribution}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" angle={-45} textAnchor="end" height={80} />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {plantTypeDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Scans */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Scans</CardTitle>
              <CardDescription>Latest leaf health assessment results</CardDescription>
            </div>
            <Link to="/history">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentScans.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No scans in this period.
              </p>
            ) : (
              recentScans.map((scan) => (
                <div
                  key={scan.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        scan.isHealthy
                          ? "bg-green-100 dark:bg-green-900/30"
                          : "bg-orange-100 dark:bg-orange-900/30"
                      }`}
                    >
                      {scan.isHealthy ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{scan.plantName}</p>
                      <p className="text-sm text-muted-foreground">
                        {scan.isHealthy ? "Healthy Leaf Patch" : "Unhealthy Leaf Patch"} •{" "}
                        {format(new Date(scan.timestamp), "MMM dd, yyyy HH:mm")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        Health Score: {scan.healthScore.toFixed(0)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {scan.confidence.toFixed(0)}% confidence
                      </p>
                    </div>
                    <Badge
                      className={
                        scan.severity === "None"
                          ? "bg-green-500 text-white"
                          : scan.severity === "Low"
                          ? "bg-yellow-500 text-white"
                          : scan.severity === "Medium"
                          ? "bg-orange-500 text-white"
                          : "bg-red-500 text-white"
                      }
                    >
                      {scan.severity}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
