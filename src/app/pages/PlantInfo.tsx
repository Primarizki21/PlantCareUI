import { useParams, Link } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { getPlantById } from "../data/plantData";
import {
  ArrowLeft,
  Leaf,
  CheckCircle2,
  XCircle,
  Sun,
  Droplets,
  Thermometer,
  Mountain,
  Activity,
  BookOpen,
  Microscope,
  ShieldCheck,
  FlaskConical,
} from "lucide-react";

export function PlantInfo() {
  const { id } = useParams<{ id: string }>();
  const plant = id ? getPlantById(id) : null;

  if (!plant) {
    return (
      <div className="container px-4 py-8">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Plant Not Found</h2>
              <p className="text-muted-foreground mb-6">
                This plant is not in our library yet.
              </p>
              <Link to="/library">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Plant Library
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <Link to="/library">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Library
          </Button>
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-5xl">{plant.icon}</span>
            <div>
              <h1 className="text-3xl font-bold mb-1">{plant.name}</h1>
              <p className="text-muted-foreground italic">{plant.scientificName}</p>
            </div>
          </div>
          <Badge variant="outline" className="text-sm px-3 py-1 mt-1">{plant.category}</Badge>
        </div>
      </div>

      {/* 1. Plant Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-green-600" />
            Plant Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">{plant.overview}</p>
        </CardContent>
      </Card>

      {/* 2. Scientific Classification */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Microscope className="h-5 w-5 text-blue-600" />
            Scientific Classification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Kingdom", value: plant.classification.kingdom },
              { label: "Family", value: plant.classification.family },
              { label: "Genus", value: plant.classification.genus },
              { label: "Species", value: plant.classification.species },
            ].map((item) => (
              <div key={item.label} className="border rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground mb-1">{item.label}</div>
                <div className="font-medium text-sm italic">{item.value}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 3. Leaf Characteristics */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-green-600" />
            Leaf Characteristics
          </CardTitle>
          <CardDescription>Physical traits of {plant.name} leaves</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {plant.leafCharacteristics.map((char, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-green-600 mt-2 flex-shrink-0" />
                <span className="text-muted-foreground">{char}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* 4. Growth Requirements */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-amber-600" />
            Growth Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Mountain className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium mb-0.5">Soil</div>
                <div className="text-sm text-muted-foreground">{plant.growthRequirements.soil}</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Droplets className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium mb-0.5">Water</div>
                <div className="text-sm text-muted-foreground">{plant.growthRequirements.water}</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Thermometer className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium mb-0.5">Temperature</div>
                <div className="text-sm text-muted-foreground">{plant.growthRequirements.temperature}</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Sun className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium mb-0.5">Sunlight</div>
                <div className="text-sm text-muted-foreground">{plant.growthRequirements.sunlight}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 5. Environmental Conditions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mountain className="h-5 w-5 text-emerald-600" />
            Environmental Conditions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm leading-relaxed">{plant.environmentalConditions}</p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* 6. Healthy Leaf Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Healthy Leaf Appearance
            </CardTitle>
            <CardDescription>Signs of a healthy, thriving leaf</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {plant.healthyLeafAppearance.map((sign, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-600 mt-1.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{sign}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* 7. Common Signs of Unhealthy Leaf Patches */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <XCircle className="h-5 w-5 text-red-600" />
              Signs of Unhealthy Leaf Patches
            </CardTitle>
            <CardDescription>Visual indicators of stressed or infected leaves</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {plant.unhealthyLeafSigns.map((sign, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-600 mt-1.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{sign}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* 8. Leaf Health Assessment Information */}
      <Card className="mb-6 border-green-500/30 bg-green-50/50 dark:bg-green-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-600" />
            Leaf Health Assessment Information
          </CardTitle>
          <CardDescription>How PlantCare AI evaluates {plant.name} leaf patches</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm leading-relaxed">{plant.leafHealthAssessmentInfo}</p>
        </CardContent>
      </Card>

      {/* 9. Best Practices for Plant Care */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-blue-600" />
            Best Practices for Plant Care
          </CardTitle>
          <CardDescription>Recommended care actions to maintain leaf health</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {plant.bestPractices.map((practice, i) => (
              <div key={i} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 flex-shrink-0">
                  <span className="text-xs font-bold text-blue-600">{i + 1}</span>
                </div>
                <p className="text-sm text-muted-foreground flex-1">{practice}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator className="my-6" />

      {/* Actions */}
      <div className="flex flex-wrap gap-4">
        <Link to="/detection">
          <Button>
            <Activity className="mr-2 h-4 w-4" />
            Assess Leaf Health
          </Button>
        </Link>
        <Link to="/library">
          <Button variant="outline">
            <Leaf className="mr-2 h-4 w-4" />
            View More Plants
          </Button>
        </Link>
      </div>
    </div>
  );
}
