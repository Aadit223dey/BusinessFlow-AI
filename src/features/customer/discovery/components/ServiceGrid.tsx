"use client";

import { motion } from "framer-motion";
import { ServiceDiscoveryItem } from "@/types/discovery";
import { ServiceCard } from "./ServiceCard";
import { ServiceDiscoverySkeleton } from "./ServiceDiscoverySkeleton";
import { CustomerEmptyState } from "@/components/shared/CustomerEmptyState";
import { SearchX, Briefcase } from "lucide-react";

interface ServiceGridProps {
  services: ServiceDiscoveryItem[];
  isLoading: boolean;
  onBookClick?: (service: ServiceDiscoveryItem) => void;
  onResetFilters?: () => void;
  isFiltered?: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

export function ServiceGrid({
  services,
  isLoading,
  onBookClick,
  onResetFilters,
  isFiltered = false,
}: ServiceGridProps) {
  if (isLoading) {
    return <ServiceDiscoverySkeleton />;
  }

  if (!services || services.length === 0) {
    if (isFiltered) {
      return (
        <div className="py-8">
          <CustomerEmptyState
            icon={SearchX}
            title="No Services Match Your Search"
            description="Try changing your keywords, picking a different category, or resetting all search filters."
            actionLabel="Reset Search Filters"
            onAction={onResetFilters}
          />
        </div>
      );
    }

    return (
      <div className="py-8">
        <CustomerEmptyState
          icon={Briefcase}
          title="No Services Currently Available"
          description="Local verified businesses and service providers will list their offerings here. Check back shortly for new service packages!"
        />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {services.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          onBookClick={onBookClick}
        />
      ))}
    </motion.div>
  );
}
