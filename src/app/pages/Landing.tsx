import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import {
  Leaf,
  ScanLine,
  TrendingUp,
  Shield,
  Zap,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Activity,
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function Landing() {
  const features = [
    {
      icon: ScanLine,
      title: "AI-Powered Analysis",
      description: "Advanced machine learning algorithms classify leaf patches as Healthy or Unhealthy with high accuracy",
    },
    {
      icon: Zap,
      title: "Instant Results",
      description: "Get leaf health percentage and severity assessment in seconds after uploading your image",
    },
    {
      icon: Shield,
      title: "Early Detection",
      description: "Spot unhealthy leaf patches early to take action before damage spreads across your crops",
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Track plant health trends over time and make data-driven decisions for better crop management",
    },
  ];

  const stats = [
    { value: "730K+", label: "Training Plant Images" },
    { value: "95%", label: "Accuracy Rate" },
    { value: "18", label: "Plant Species" },
    { value: "2", label: "Health Classes" },
  ];

  const benefits = [
    "Upload images via drag & drop or camera",
    "Detect leaf patches from all plant species",
    "Classify leaf patches as Healthy or Unhealthy",
    "View leaf health percentage and severity level",
    "Save scan history and analysis results",
    "AI-powered analysis with high accuracy",
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section — full-width cinematic */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-green-950">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1519082572439-7ed19908e47e?w=1800&h=1000&fit=crop&auto=format"
            alt="Aerial view of rice paddy agricultural fields"
            className="w-full h-full object-cover object-center"
          />
          {/* Gradient overlay: dark left, transparent right */}
          <div className="absolute inset-0"
            style={{
              background: "linear-gradient(105deg, rgba(5,22,11,0.92) 0%, rgba(5,22,11,0.82) 35%, rgba(5,22,11,0.50) 60%, rgba(5,22,11,0.18) 100%)"
            }}
          />
          {/* Subtle vignette */}
          <div className="absolute inset-0"
            style={{
              background: "radial-gradient(ellipse at 30% 50%, transparent 40%, rgba(0,0,0,0.35) 100%)"
            }}
          />
        </div>

        {/* Hero content */}
        <div className="relative container px-6 md:px-10 py-24 md:py-32 pb-36 md:pb-48 max-w-7xl mx-auto">
          <div className="max-w-2xl flex flex-col gap-7">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-green-400/30 bg-green-500/10 backdrop-blur-sm px-4 py-1.5 text-sm text-green-300 w-fit">
              <Leaf className="h-3.5 w-3.5" />
              <span>AI-Powered Plant Health Assessment</span>
            </div>

            {/* Headline */}
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.0] text-white">
              Analyze Leaf<br />Health with{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(90deg, #22C55E 0%, #16A34A 100%)" }}
              >
                AI Technology
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg md:text-xl text-gray-300 max-w-lg leading-relaxed">
              Upload a photo of your plant leaf and instantly classify leaf patches as Healthy or Unhealthy — powered by advanced machine learning.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 mt-2">
              <Link to="/detection">
                <Button
                  size="lg"
                  className="gap-2 bg-green-500 hover:bg-green-400 text-white rounded-xl font-semibold px-7 py-3 text-base shadow-lg shadow-green-900/40 transition-all duration-200"
                >
                  <ScanLine className="h-5 w-5" />
                  Start Health Check
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/library">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 rounded-xl font-semibold px-7 py-3 text-base bg-white/5 border-white/20 text-white hover:bg-white/15 hover:border-white/30 backdrop-blur-sm transition-all duration-200"
                >
                  <Leaf className="h-5 w-5" />
                  Browse Plant Library
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Glassmorphism stats panel at bottom */}
        <div className="absolute bottom-0 left-0 right-0 px-6 md:px-10 pb-6 md:pb-8">
          <div
            className="max-w-7xl mx-auto rounded-[20px] border border-white/10 backdrop-blur-md shadow-2xl"
            style={{ background: "rgba(5,15,8,0.65)" }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
              {stats.map((stat, i) => (
                <div key={i} className="flex flex-col items-center justify-center py-5 px-6 gap-1">
                  <span className="text-2xl md:text-3xl font-bold text-white">{stat.value}</span>
                  <span className="text-xs text-gray-400 text-center">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powerful Features for Farmers
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to assess and monitor leaf health across your crops
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-2 hover:border-green-500/50 transition-colors">
                  <CardContent className="pt-6">
                    <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-muted/50 py-20">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Assess leaf health in three simple steps
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                title: "Upload Image",
                description: "Take a photo of your plant leaf or upload from your gallery",
              },
              {
                step: "02",
                title: "AI Analysis",
                description: "Our AI scans leaf patches and classifies them as Healthy or Unhealthy",
              },
              {
                step: "03",
                title: "Get Results",
                description: "Receive leaf health percentage, severity level, and care recommendations",
              },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl font-bold text-green-600/20 mb-4">{item.step}</div>
                <h3 className="font-semibold text-xl mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800&h=600&fit=crop&auto=format"
                alt="Modern agriculture technology"
                className="rounded-2xl w-full h-auto shadow-xl"
              />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Why Choose PlantCare AI?
              </h2>
              <p className="text-muted-foreground mb-8">
                Leverage advanced AI technology to analyze leaf health across different plant species with fast and reliable results.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
              <Link to="/detection" className="inline-block mt-8">
                <Button size="lg" className="gap-2">
                  <Activity className="h-5 w-5" />
                  Assess Leaf Health Now
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-green-600 to-emerald-700">
        <div className="container px-4">
          <div className="text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Assess Your Plant Health?
            </h2>
            <p className="text-lg mb-8 text-green-50 max-w-2xl mx-auto">
              Join farmers using AI to monitor leaf health and maintain healthier crops
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/detection">
                <Button size="lg" variant="secondary" className="gap-2">
                  <ScanLine className="h-5 w-5" />
                  Start Health Assessment
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20 gap-2">
                  <TrendingUp className="h-5 w-5" />
                  View Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
