import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ShoppingBag,
  Wrench,
  Search,
  ArrowRight,
  MapPin,
  Shield,
  Smartphone,
} from "lucide-react";
import ListingCard from "@/components/shared/ListingCard";

/**
 * Replace this with your real backend (Supabase, Firebase, Express API)
 */
const api = {
  getProducts: async () => {
    const res = await fetch("/api/products?status=active&limit=8");
    return res.json();
  },

  getServices: async () => {
    const res = await fetch("/api/services?status=active&limit=8");
    return res.json();
  },
};

const heroStats = [
  { label: "Active Listings", value: "1000+" },
  { label: "Service Providers", value: "500+" },
  { label: "Happy Users", value: "5000+" },
];

const serviceHighlights = [
  { icon: "🔧", label: "Plumber" },
  { icon: "⚡", label: "Electrician" },
  { icon: "🌿", label: "Gardener" },
  { icon: "🧹", label: "Cleaner" },
  { icon: "🎨", label: "Painter" },
  { icon: "🔨", label: "Handyman" },
];

export default function Home() {
  const [search, setSearch] = useState("");

  // Fetch products
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: api.getProducts,
  });

  // Fetch services
  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn: api.getServices,
  });

  return (
    <div className="space-y-16 pb-20">

      {/* ================= HERO ================= */}
      <section className="relative -mx-4 -mt-6 px-4 pt-12 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />

        <div className="relative max-w-2xl mx-auto text-center space-y-6">

          <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5">
            🇿🇦 South Africa's Local Marketplace
          </Badge>

          <h1 className="font-bold text-4xl md:text-5xl">
            Buy, Sell & Hire
            <span className="block text-primary">In Your Community</span>
          </h1>

          <p className="text-muted-foreground text-lg">
            Find products and trusted service providers near you across South Africa.
          </p>

          {/* Search */}
          <div className="flex gap-2 max-w-md mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search products or services..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-12 rounded-xl"
              />
            </div>

            <Link to={search ? `/products?search=${search}` : "/products"}>
              <Button className="h-12 px-6">Search</Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 pt-4">
            {heroStats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-bold text-xl">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= SERVICES ================= */}
      <section>
        <h2 className="font-bold text-2xl mb-6">Find a Service</h2>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {serviceHighlights.map((s) => (
            <Link
              key={s.label}
              to={`/services?type=${s.label.toLowerCase()}`}
              className="p-4 rounded-2xl border bg-card text-center hover:border-primary"
            >
              <div className="text-2xl">{s.icon}</div>
              <p className="text-xs mt-2 text-muted-foreground">{s.label}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ================= PRODUCTS ================= */}
      <section>
        <div className="flex justify-between mb-6">
          <h2 className="font-bold text-2xl">Latest Products</h2>
          <Link to="/products">
            <Button variant="ghost" size="sm">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((p) => (
              <ListingCard key={p.id} item={p} type="product" />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={ShoppingBag}
            text="No products yet. Be the first to list one!"
            link="/create-listing"
            buttonText="List Product"
          />
        )}
      </section>

      {/* ================= SERVICES LIST ================= */}
      <section>
        <div className="flex justify-between mb-6">
          <h2 className="font-bold text-2xl">Available Services</h2>
          <Link to="/services">
            <Button variant="ghost" size="sm">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        {services.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {services.map((s) => (
              <ListingCard key={s.id} item={s} type="service" />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Wrench}
            text="No services available yet."
            link="/create-listing"
            buttonText="Advertise Service"
          />
        )}
      </section>

      {/* ================= FEATURES ================= */}
      <section className="grid md:grid-cols-3 gap-6">
        {[
          {
            icon: MapPin,
            title: "Location-Based",
            desc: "Find services near you anywhere in South Africa.",
          },
          {
            icon: Shield,
            title: "Trusted Platform",
            desc: "Ratings and reviews keep the community safe.",
          },
          {
            icon: Smartphone,
            title: "Mobile Friendly",
            desc: "Lightweight design for low-data users.",
          },
        ].map((f) => (
          <div
            key={f.title}
            className="p-6 border rounded-2xl text-center space-y-3"
          >
            <f.icon className="mx-auto text-primary w-6 h-6" />
            <h3 className="font-semibold">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
