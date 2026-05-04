import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Wrench } from "lucide-react";
import ListingCard from "@/components/shared/ListingCard";
import FilterBar from "@/components/shared/FilterBar";
import EmptyState from "@/components/shared/EmptyState";
import { SERVICE_TYPES, PROVINCES } from "@/lib/constants";

/**
 * Replace with Supabase / Firebase / REST API
 */
const api = {
  getServices: async () => {
    const res = await fetch("/api/services?status=active");
    return res.json();
  },
};

export default function Services() {
  const urlParams = new URLSearchParams(window.location.search);

  const [filters, setFilters] = useState({
    search: urlParams.get("search") || "",
    service_type: urlParams.get("type") || "all",
    province: "all",
  });

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: api.getServices,
  });

  const filteredServices = services.filter((service) => {
    const searchMatch =
      !filters.search ||
      service.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
      service.description
        ?.toLowerCase()
        .includes(filters.search.toLowerCase());

    const typeMatch =
      filters.service_type === "all" ||
      service.service_type === filters.service_type;

    const provinceMatch =
      filters.province === "all" ||
      service.province === filters.province;

    return searchMatch && typeMatch && provinceMatch;
  });

  return (
    <div className="pb-20">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Services</h1>
        <p className="text-sm text-muted-foreground">
          Find trusted service providers near you
        </p>
      </div>

      {/* FILTERS */}
      <FilterBar
        filters={filters}
        setFilters={setFilters}
        options={[
          {
            key: "service_type",
            label: "Type",
            items: SERVICE_TYPES,
          },
          {
            key: "province",
            label: "Province",
            items: PROVINCES,
          },
        ]}
      />

      {/* LOADING STATE */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array(8)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="aspect-[4/3] rounded-xl bg-muted animate-pulse"
              />
            ))}
        </div>
      ) : filteredServices.length > 0 ? (
        /* LISTINGS */
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filteredServices.map((service) => (
            <ListingCard
              key={service.id}
              item={service}
              type="service"
            />
          ))}
        </div>
      ) : (
        /* EMPTY STATE */
        <EmptyState
          icon={Wrench}
          title="No services found"
          description="Try changing filters or advertise your skills"
          actionLabel="Advertise a Service"
          actionLink="/create-listing"
        />
      )}
    </div>
  );
}
