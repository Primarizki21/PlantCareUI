import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { User, Mail, MapPin, Calendar, Award, Leaf, Camera } from "lucide-react";
import { mockScans } from "../data/mockScans";

export function Profile() {
  const totalScans = mockScans.length;
  const healthyScans = mockScans.filter((s) => s.isHealthy).length;
  const unhealthyScans = mockScans.filter((s) => !s.isHealthy).length;

  const achievements = [
    { icon: Leaf, label: "First Scan", description: "Completed your first leaf health assessment", unlocked: true },
    { icon: Award, label: "10 Scans", description: "Performed 10 leaf health scans", unlocked: true },
    { icon: Award, label: "Patch Detector", description: "Found 5 unhealthy leaf patches", unlocked: true },
    { icon: Award, label: "50 Scans", description: "Performed 50 leaf health scans", unlocked: false },
    { icon: Award, label: "Plant Expert", description: "Scanned all plant types", unlocked: false },
  ];

  return (
    <div className="container px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings and view your activity
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarFallback className="text-2xl bg-green-100 dark:bg-green-900/30 text-green-600">
                      JD
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    variant="outline"
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div>
                  <h3 className="font-bold text-xl">John Doe</h3>
                  <p className="text-sm text-muted-foreground">Farmer & Plant Enthusiast</p>
                </div>
                <Badge variant="secondary" className="gap-1">
                  <Award className="h-3 w-3" />
                  Advanced User
                </Badge>
              </div>

              <Separator className="my-6" />

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">john.doe@example.com</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">California, USA</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Joined May 2026</span>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-600">{totalScans}</p>
                  <p className="text-xs text-muted-foreground">Total Scans</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{healthyScans}</p>
                  <p className="text-xs text-muted-foreground">Healthy</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">{unhealthyScans}</p>
                  <p className="text-xs text-muted-foreground">Unhealthy</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue="John" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue="Doe" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="john.doe@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" defaultValue="+1 (555) 123-4567" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" defaultValue="California, USA" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input id="timezone" defaultValue="Pacific Time (PT)" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
              <CardDescription>Your milestones and accomplishments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                {achievements.map((achievement, index) => {
                  const Icon = achievement.icon;
                  return (
                    <div
                      key={index}
                      className={`p-4 border rounded-lg ${
                        achievement.unlocked
                          ? "bg-green-50 dark:bg-green-900/10 border-green-500/50"
                          : "opacity-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                            achievement.unlocked
                              ? "bg-green-100 dark:bg-green-900/30"
                              : "bg-muted"
                          }`}
                        >
                          <Icon
                            className={`h-5 w-5 ${
                              achievement.unlocked ? "text-green-600" : "text-muted-foreground"
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm mb-1">{achievement.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {achievement.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
              <CardDescription>Manage your account preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <User className="mr-2 h-4 w-4" />
                Change Password
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Mail className="mr-2 h-4 w-4" />
                Email Preferences
              </Button>
              <Separator className="my-4" />
              <Button variant="destructive" className="w-full justify-start">
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
