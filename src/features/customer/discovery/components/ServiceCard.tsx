"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ServiceDiscoveryItem } from "@/types/discovery";
import { Clock, Sparkles, ArrowRight, Building2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ServiceCardProps {
  service: ServiceDiscoveryItem;
  onBookClick?: (service: ServiceDiscoveryItem) => void;
}

export function ServiceCard({ service, onBookClick }: ServiceCardProps) {
  const formatPrice = (price: number, currency: string) => {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency || "USD",
      }).format(price);
    } catch {
      return `$${price.toFixed(2)}`;
    }
  };

  const handleBook = (e: React.MouseEvent) => {
    if (onBookClick) {
      e.preventDefault();
      e.stopPropagation();
      onBookClick(service);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/70 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 p-5 backdrop-blur-md shadow-sm hover:shadow-xl hover:border-emerald-500/30 transition-all duration-300"
    >
      <Link
        href={`/customer/services/${service.id}`}
        className="absolute inset-0 z-0"
        aria-label={`View details for ${service.name}`}
      />

      <div className="relative z-10 space-y-4">
        {/* Top Badges & Business Name */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {service.category ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                <Tag className="h-3 w-3" />
                <span>{service.category.name}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                General
              </span>
            )}

            {service.isFeatured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                <Sparkles className="h-2.5 w-2.5 fill-amber-500" />
                <span>Featured</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Building2 className="h-3.5 w-3.5 text-slate-400" />
            <span className="truncate max-w-[130px]">{service.business.name}</span>
          </div>
        </div>

        {/* Service Title & Description */}
        <div className="space-y-1.5">
          <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {service.name}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {service.description || "Professional service provided by verified business."}
          </p>
        </div>
      </div>

      {/* Footer: Duration, Price, and Booking Action */}
      <div className="relative z-10 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            <Clock className="h-3 w-3 text-emerald-500" />
            <span>{service.durationMinutes} mins</span>
          </div>
          <p className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
            {formatPrice(service.price, service.currency)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="primary"
            onClick={handleBook}
            className="rounded-xl px-4 text-xs font-bold gap-1.5 shadow-sm shadow-emerald-500/20"
          >
            <span>Book Now</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
