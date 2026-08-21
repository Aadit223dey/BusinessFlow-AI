"use client";

import Link from "next/link";
import { ServiceDiscoveryItem } from "@/types/discovery";
import { ArrowLeft, Clock, Tag, Sparkles, Building2 } from "lucide-react";

interface ServiceDetailHeaderProps {
  service: ServiceDiscoveryItem;
}

export function ServiceDetailHeader({ service }: ServiceDetailHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 p-6 sm:p-10 text-white shadow-xl">
      <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

      <div className="relative z-10 space-y-4 max-w-3xl">
        {/* Back Link */}
        <Link
          href="/customer/services"
          className="inline-flex items-center gap-2 text-xs font-bold text-emerald-100 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors backdrop-blur-md"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Service Discovery</span>
        </Link>

        {/* Category & Featured Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {service.category && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
              <Tag className="h-3.5 w-3.5" />
              <span>{service.category.name}</span>
            </span>
          )}

          {service.isFeatured && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/30 border border-amber-300/40 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-amber-200 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 fill-amber-300" />
              <span>Featured Service</span>
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          {service.name}
        </h1>

        {/* Provider attribution & Duration pills */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-emerald-100 pt-1">
          <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl backdrop-blur-sm">
            <Building2 className="h-4 w-4 text-emerald-300" />
            <span>Offered by: <strong className="text-white font-bold">{service.business.name}</strong></span>
          </div>

          <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl backdrop-blur-sm">
            <Clock className="h-4 w-4 text-emerald-300" />
            <span>Duration: <strong className="text-white font-bold">{service.durationMinutes} mins</strong></span>
          </div>

          {service.bufferTimeMinutes > 0 && (
            <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl backdrop-blur-sm">
              <span>Buffer: <strong className="text-white font-bold">+{service.bufferTimeMinutes} mins prep</strong></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
