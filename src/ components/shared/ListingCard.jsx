import React from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock } from "lucide-react";
import { formatPrice, getProvinceLabel, getServiceTypeLabel, getCategoryLabel } from "@/lib/constants";
import StarRating from "./StarRating";

export default function ListingCard({ item, type = "product" }) {
  const isProduct = type === "product";
  const link = isProduct ? `/products/${item.id}` : `/services/${item.id}`;
  const placeholder = isProduct
    ? "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80"
    : "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=80";

  const image = item.images?.[0] || placeholder;

  return (
    <Link to={link}>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-card">
        <div className="aspect-[4/3] overflow-hidden relative">
          <img
            src={image}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {isProduct && item.condition && (
            <Badge className="absolute top-3 left-3 bg-card/90 text-foreground backdrop-blur-sm text-xs capitalize">
              {item.condition.replace("_", " ")}
            </Badge>
          )}
          {!isProduct && item.is_verified && (
            <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground text-xs">
              Verified
            </Badge>
          )}
          {item.status === "sold" && (
            <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
              <span className="text-white font-heading font-bold text-lg">SOLD</span>
            </div>
          )}
        </div>

        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
              {item.title}
            </h3>
            {isProduct ? (
              <span className="font-heading font-bold text-primary whitespace-nowrap">
                {formatPrice(item.price)}
              </span>
            ) : (
              <span className="font-heading font-bold text-primary whitespace-nowrap text-sm">
                {item.price_range_min ? `${formatPrice(item.price_range_min)}+` : "Negotiable"}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary" className="text-[10px] px-2 py-0 font-normal">
              {isProduct ? getCategoryLabel(item.category) : getServiceTypeLabel(item.service_type)}
            </Badge>
            {item.province && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {getProvinceLabel(item.province)}
              </span>
            )}
          </div>

          {!isProduct && item.availability && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span className="capitalize">{item.availability}</span>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
