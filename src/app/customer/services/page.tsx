"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ServiceFilterState, ServiceDiscoveryItem } from "@/types/discovery";
import { useServiceDiscovery } from "@/features/customer/hooks/use-service-discovery";
import { useServiceCategories } from "@/features/customer/hooks/use-service-categories";
import { ServiceSearchFilterBar } from "@/features/customer/discovery/components/ServiceSearchFilterBar";
import { ServiceGrid } from "@/features/customer/discovery/components/ServiceGrid";
import { CustomerErrorBoundary } from "@/components/shared/CustomerErrorBoundary";
import { Sparkles, Compass } from "lucide-react";

export default function ServiceDiscoveryPage() {
  const router = useRouter();

  const [filters, setFilters] = useState<ServiceFilterState>({
    searchQuery: "",
    categoryId: null,
    tenantId: null,
    maxPrice: null,
    maxDuration: null,
    sortBy: "popular",
  });

  const { data: services, isLoading: isServicesLoading } = useServiceDiscovery(filters);
  const { data: categories } = useServiceCategories();

  const handleBookClick = (service: ServiceDiscoveryItem) => {
    router.push(`/customer/services/${service.id}`);
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: "",
      categoryId: null,
      tenantId: null,
      maxPrice: null,
      maxDuration: null,
      sortBy: "popular",
    });
  };

  const isFiltered =
    Boolean(filters.searchQuery.trim()) ||
    filters.categoryId !== null ||
    filters.sortBy !== "popular";

  return (
    <CustomerErrorBoundary moduleName="Service Discovery Catalog">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-8 max-w-7xl mx-auto w-full pb-12"
      >
        {/* Header Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 p-6 sm:p-10 text-white shadow-xl">
          <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          <div className="relative z-10 space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold text-white backdrop-blur-md">
              <Compass className="h-4 w-4" />
              <span>Service Discovery Catalog</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Explore & Book Services 🌟
            </h1>

            <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">
              Browse curated, professional offerings from local verified businesses. Inspect session pricing, durations, and provider credentials.
            </p>
          </div>
        </div>

        {/* Search & Category Filter Controls */}
        <ServiceSearchFilterBar
          filters={filters}
          onFilterChange={setFilters}
          categories={categories || []}
          totalResults={services?.length || 0}
        />

        {/* Service Cards Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-500" />
              <span>Available Services</span>
              <span className="text-xs font-semibold text-muted-foreground">
                ({services?.length || 0})
              </span>
            </h2>
          </div>

          <ServiceGrid
            services={services || []}
            isLoading={isServicesLoading}
            onBookClick={handleBookClick}
            onResetFilters={handleResetFilters}
            isFiltered={isFiltered}
          />
        </div>
      </motion.div>
    </CustomerErrorBoundary>
  );
}
