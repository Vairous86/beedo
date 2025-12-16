import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { PlatformCard } from "@/components/PlatformCard";
import { Platform, Service } from "@/lib/localStorage";
import {
  getPlatforms as fetchPlatforms,
  getMostRequested as fetchMostRequested,
  getServices as fetchServices,
} from "@/lib/db";
import { Input } from "@/components/ui/input";
import { Search, Shield, Clock, Award, Headphones } from "lucide-react";
import { Link } from "react-router-dom";

import { Card } from "@/components/ui/card";

const Index = () => {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [most, setMost] = useState<Array<{ service_id: string; visible: boolean }>>([]);
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const load = async () => {
      const platRes = await fetchPlatforms();
      const platArr = Array.isArray(platRes?.data) ? (platRes.data as Platform[]) : [];
      setPlatforms(platArr);
      const mostRes = await fetchMostRequested();
      const mostArr = Array.isArray(mostRes?.data)
        ? (mostRes.data as Array<{ service_id: string; visible: boolean }>)
        : [];
      setMost(mostArr);
      const svcRes = await fetchServices();
      const svcArr = Array.isArray(svcRes?.data) ? (svcRes.data as Service[]) : [];
      setServices(svcArr);
    };
    load();
  }, []);

  const filteredPlatforms = platforms.filter(
    (platform) =>
      platform.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      platform.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto max-w-6xl text-center animate-fade-in">
          <h1 className="text-4xl md:text-5xl lg:text-5xl font-heading font-bold text-foreground mb-4">
            Scale Your Social Presence — Fast, Safe, Real.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            Premium social media growth services | Instant delivery | Verified
            engagement.
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto relative mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Search platforms or services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 border-border shadow-card"
            />
          </div>

          {/* Most Requested inside hero */}
          <div className="mt-6">
            <div className="flex items-center justify-between max-w-6xl mx-auto mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                Most Requested
              </h3>
              <Link to="/platforms" className="text-sm text-primary underline">
                View all
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
              {most
                .slice(0, 6)
                .map((m) => {
                  const s = services.find((x) => x.id === (m as any).service_id);
                  if (!s || !m.visible) return null;
                  return (
                    <Link key={s.id} to={`/service/${s.id}`} className="block">
                      <Card className="p-3 shadow-card hover:shadow-lg rounded-lg bg-card">
                        <div className="flex items-center gap-3">
                          <img
                            src={s.image}
                            alt={s.title}
                            className="w-16 h-16 rounded-md object-cover"
                          />
                          <div className="flex-1 text-left">
                            <div className="font-semibold text-foreground">
                              {s.title}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Avg delivery: {s.deliveryTime}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  );
                })}
            </div>
          </div>
        </div>
      </section>

      {/* Platforms Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-heading font-bold text-foreground text-center mb-12">
            Choose Your Platform
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlatforms.map((platform, index) => (
              <div
                key={platform.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <PlatformCard platform={platform} />
              </div>
            ))}
          </div>

          {filteredPlatforms.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                No platforms found matching your search.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-heading font-bold text-foreground text-center mb-12">
            Why Choose Us?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center animate-scale-in">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Clock className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-2">
                Fast Delivery
              </h3>
              <p className="text-muted-foreground text-sm">
                Most orders delivered within hours
              </p>
            </div>
            <div
              className="text-center animate-scale-in"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-2">
                100% Safe
              </h3>
              <p className="text-muted-foreground text-sm">
                Secure payments and privacy
              </p>
            </div>
            <div
              className="text-center animate-scale-in"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Award className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-2">
                Quality Guarantee
              </h3>
              <p className="text-muted-foreground text-sm">
                Real engagement from real users
              </p>
            </div>
            <div
              className="text-center animate-scale-in"
              style={{ animationDelay: "0.3s" }}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Headphones className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-2">
                24/7 Support
              </h3>
              <p className="text-muted-foreground text-sm">
                Always here to help you
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="animate-scale-in">
              <div className="text-4xl font-heading font-bold text-primary mb-2">
                50K+
              </div>
              <div className="text-muted-foreground">Happy Customers</div>
            </div>
            <div
              className="animate-scale-in"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="text-4xl font-heading font-bold text-primary mb-2">
                99%
              </div>
              <div className="text-muted-foreground">Satisfaction Rate</div>
            </div>
            <div
              className="animate-scale-in"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="text-4xl font-heading font-bold text-primary mb-2">
                1M+
              </div>
              <div className="text-muted-foreground">Orders Completed</div>
            </div>
            <div
              className="animate-scale-in"
              style={{ animationDelay: "0.3s" }}
            >
              <div className="text-4xl font-heading font-bold text-primary mb-2">
                100%
              </div>
              <div className="text-muted-foreground">Safe & Secure</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
