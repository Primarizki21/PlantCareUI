import { useParams, Link } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { getDiseaseById } from "../data/plantData";
import {
  AlertTriangle,
  Bug,
  Shield,
  Stethoscope,
  ArrowLeft,
  Leaf,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";

export function DiseaseInfo() {
  const { id } = useParams<{ id: string }>();
  const disease = id ? getDiseaseById(id) : null;

  if (!disease) {
    return (
      <div className="container px-4 py-8">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Disease Not Found</h2>
              <p className="text-muted-foreground mb-6">
                The disease you're looking for doesn't exist in our database.
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Low":
        return "bg-yellow-500";
      case "Medium":
        return "bg-orange-500";
      case "High":
        return "bg-red-500";
      case "Critical":
        return "bg-red-700";
      default:
        return "bg-gray-500";
    }
  };

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
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{disease.name}</h1>
            <p className="text-muted-foreground">Affects {disease.plantType} plants</p>
          </div>
          <Badge className={`${getSeverityColor(disease.severity)} text-white`}>
            {disease.severity} Severity
          </Badge>
        </div>
      </div>

      {/* Alert */}
      {(disease.severity === "Critical" || disease.severity === "High") && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>High Risk Disease</AlertTitle>
          <AlertDescription>
            This disease is considered {disease.severity.toLowerCase()} severity and requires
            immediate attention to prevent crop loss.
          </AlertDescription>
        </Alert>
      )}

      {/* Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5" />
            Disease Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{disease.description}</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Affects: {disease.affectedArea}</Badge>
            <Badge variant="outline">Plant: {disease.plantType}</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Symptoms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Symptoms
            </CardTitle>
            <CardDescription>Visible signs of infection</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {disease.symptoms.map((symptom, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-orange-600 mt-1.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{symptom}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Causes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bug className="h-5 w-5 text-red-600" />
              Causes
            </CardTitle>
            <CardDescription>What triggers this disease</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {disease.causes.map((cause, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-600 mt-1.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{cause}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Treatment */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-blue-600" />
            Treatment Recommendations
          </CardTitle>
          <CardDescription>
            Follow these steps to treat infected plants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {disease.treatment.map((treatment, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 flex-shrink-0">
                  <span className="text-xs font-bold text-blue-600">{index + 1}</span>
                </div>
                <p className="text-sm text-muted-foreground flex-1">{treatment}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Prevention */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Prevention Methods
          </CardTitle>
          <CardDescription>
            Best practices to prevent disease occurrence
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-3">
            {disease.prevention.map((prevention, index) => (
              <div key={index} className="flex items-start gap-2 p-3 border rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{prevention}</span>
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
            <Leaf className="mr-2 h-4 w-4" />
            Detect This Disease
          </Button>
        </Link>
        <Link to="/library">
          <Button variant="outline">
            View More Diseases
          </Button>
        </Link>
      </div>
    </div>
  );
}
