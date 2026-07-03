import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { plantInfoList } from "../data/plantData";
import type { PlantInfo } from "../data/plantData";
import { Link } from "react-router";
import { Search, Leaf, Activity, ChevronRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

export function PlantLibrary() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPlants = plantInfoList.filter(
    (plant) =>
      plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plant.scientificName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plant.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = Array.from(new Set(plantInfoList.map((p) => p.category)));

  return (
    <div className="container px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Plant Library</h1>
        <p className="text-muted-foreground">
          Browse key Indonesian crop plants and their leaf health assessment information
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search plants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs defaultValue="all" className="mb-6">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="all">All Plants ({plantInfoList.length})</TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger key={category} value={category}>
              {category} ({plantInfoList.filter((p) => p.category === category).length})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <PlantGrid plants={filteredPlants} />
        </TabsContent>

        {categories.map((category) => (
          <TabsContent key={category} value={category} className="mt-6">
            <PlantGrid plants={filteredPlants.filter((p) => p.category === category)} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function PlantGrid({ plants }: { plants: PlantInfo[] }) {
  if (plants.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center text-muted-foreground">
          <Leaf className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No plants found matching your search</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {plants.map((plant) => (
        <Card key={plant.id} className="hover:border-green-500/50 transition-colors flex flex-col">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="text-4xl">{plant.icon}</div>
                <div>
                  <CardTitle className="text-lg">{plant.name}</CardTitle>
                  <CardDescription className="text-xs italic">
                    {plant.scientificName}
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline">{plant.category}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 flex flex-col">
            <p className="text-sm text-muted-foreground">{plant.description}</p>

            {/* Leaf Characteristics */}
            <div>
              <div className="flex items-center gap-1 mb-2">
                <Activity className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Leaf Characteristics</span>
              </div>
              <div className="space-y-1.5">
                {plant.leafCharacteristics.map((char, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 border rounded-lg text-sm">
                    <span className="text-green-600 flex-shrink-0 mt-0.5">•</span>
                    <span className="text-muted-foreground flex-1">{char}</span>
                    {i === 0 && <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Growing environment */}
            <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
              <span className="font-medium text-foreground">Environment: </span>
              {plant.growingEnvironment}
            </div>

            <div className="mt-auto pt-2">
              <Link to={`/plant/${plant.id}`}>
                <Button variant="outline" className="w-full gap-2">
                  <Leaf className="h-4 w-4" />
                  View Plant Information
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
