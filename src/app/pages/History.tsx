import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  getScans,
  getAverageConfidence,
} from "../services/scanHistory";
import {
  Search,
  Download,
  CheckCircle2,
  AlertCircle,
  Calendar,
  TrendingUp,
  Leaf,
} from "lucide-react";
import { format } from "date-fns";

export function History() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPlant, setFilterPlant] = useState<string>("all");

  const scans = getScans();

  const filteredScans = scans.filter((scan) => {
    const matchesSearch =
      scan.plantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scan.plantType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "healthy" && scan.isHealthy) ||
      (filterStatus === "unhealthy" && !scan.isHealthy);

    const matchesPlant = filterPlant === "all" || scan.plantType === filterPlant;

    return matchesSearch && matchesStatus && matchesPlant;
  });

  const plantTypes = Array.from(new Set(scans.map((s) => s.plantType))).sort();

  const getSeverityBadge = (severity: string) => {
    const colors: { [key: string]: string } = {
      None:     "bg-green-500",
      Low:      "bg-yellow-500",
      Medium:   "bg-orange-500",
      High:     "bg-red-500",
      Critical: "bg-red-700",
    };
    return <Badge className={`${colors[severity] || "bg-gray-500"} text-white`}>{severity}</Badge>;
  };

  const stats = [
    {
      label: "Total Scans",
      value: scans.length,
      icon: Calendar,
      color: "text-blue-600",
    },
    {
      label: "Healthy Leaves",
      value: scans.filter((s) => s.isHealthy).length,
      icon: CheckCircle2,
      color: "text-green-600",
    },
    {
      label: "Unhealthy Leaves",
      value: scans.filter((s) => !s.isHealthy).length,
      icon: AlertCircle,
      color: "text-orange-600",
    },
    {
      label: "Avg Confidence",
      value:
        scans.length > 0
          ? getAverageConfidence(scans) + "%"
          : "—",
      icon: TrendingUp,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="container px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Scan History</h1>
        <p className="text-muted-foreground">
          View and manage all your leaf health assessment scans
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4">
            {/* Search by plant name */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by plant name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Status filter */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="healthy">Healthy Only</SelectItem>
                <SelectItem value="unhealthy">Unhealthy Only</SelectItem>
              </SelectContent>
            </Select>

            {/* Plant type filter */}
            <Select value={filterPlant} onValueChange={setFilterPlant}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by plant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plants</SelectItem>
                {plantTypes.map((plant) => (
                  <SelectItem key={plant} value={plant}>
                    {plant}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Scans Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Scans</CardTitle>
              <CardDescription>
                {filteredScans.length} scan{filteredScans.length !== 1 ? "s" : ""} found
              </CardDescription>
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Date</TableHead>
                  <TableHead>Plant</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead className="whitespace-nowrap">Healthy Area</TableHead>
                  <TableHead className="whitespace-nowrap">Unhealthy Area</TableHead>
                  <TableHead className="whitespace-nowrap">Health Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredScans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      <Leaf className="h-8 w-8 mx-auto mb-2 opacity-40" />
                      No scans found matching your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredScans.map((scan) => (
                    <TableRow key={scan.id}>
                      {/* Date */}
                      <TableCell className="font-medium whitespace-nowrap">
                        {format(new Date(scan.timestamp), "MMM dd, yyyy")}
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(scan.timestamp), "HH:mm")}
                        </div>
                      </TableCell>

                      {/* Plant */}
                      <TableCell>
                        <span className="font-medium">{scan.plantName}</span>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        {scan.isHealthy ? (
                          <div className="flex items-center gap-1.5 text-green-600">
                            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                            <span className="text-sm font-medium">Healthy</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-orange-600">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            <span className="text-sm font-medium">Unhealthy</span>
                          </div>
                        )}
                      </TableCell>

                      {/* Severity */}
                      <TableCell>{getSeverityBadge(scan.severity)}</TableCell>

                      {/* Confidence */}
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-600 rounded-full"
                              style={{ width: `${scan.confidence}%` }}
                            />
                          </div>
                          <span className="text-sm">{scan.confidence.toFixed(0)}%</span>
                        </div>
                      </TableCell>

                      {/* Healthy Area */}
                      <TableCell>
                        <span className="text-sm font-medium text-green-600">
                          {scan.healthyArea.toFixed(0)}%
                        </span>
                      </TableCell>

                      {/* Unhealthy Area */}
                      <TableCell>
                        <span
                          className={`text-sm font-medium ${
                            scan.unhealthyArea > 0 ? "text-orange-600" : "text-muted-foreground"
                          }`}
                        >
                          {scan.unhealthyArea.toFixed(0)}%
                        </span>
                      </TableCell>

                      {/* Health Score */}
                      <TableCell>
                        <span
                          className={`font-semibold ${
                            scan.healthScore >= 80
                              ? "text-green-600"
                              : scan.healthScore >= 60
                              ? "text-yellow-600"
                              : scan.healthScore >= 40
                              ? "text-orange-600"
                              : "text-red-600"
                          }`}
                        >
                          {scan.healthScore.toFixed(0)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
