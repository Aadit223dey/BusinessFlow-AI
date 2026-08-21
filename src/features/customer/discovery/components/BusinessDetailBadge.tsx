"use client";

import { BusinessPublicProfile } from "@/types/discovery";
import { Building2, MapPin, Clock, Phone, Mail, Globe } from "lucide-react";

interface BusinessDetailBadgeProps {
  business: BusinessPublicProfile;
  variant?: "card" | "pill" | "banner";
  className?: string;
}

export function BusinessDetailBadge({
  business,
  variant = "card",
  className = "",
}: BusinessDetailBadgeProps) {
  if (variant === "pill") {
    return (
      <div
        className={`inline-flex items-center gap-2 rounded-full border border-slate-200/80 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-800/80 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 backdrop-blur-sm ${className}`}
      >
        <Building2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
        <span className="truncate max-w-[160px]">{business.name}</span>
        {business.city && (
          <span className="text-[10px] text-slate-400 font-normal border-l border-slate-300 dark:border-slate-700 pl-1.5">
            {business.city}
          </span>
        )}
      </div>
    );
  }

  if (variant === "banner") {
    return (
      <div
        className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 p-5 backdrop-blur-md ${className}`}
      >
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500/10 to-teal-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm">
            {business.logoUrl ? (
              <img
                src={business.logoUrl}
                alt={business.name}
                className="h-full w-full rounded-2xl object-cover"
              />
            ) : (
              <Building2 className="h-6 w-6" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {business.name}
              </h4>
              {business.category && (
                <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  {business.category}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
              {(business.address || business.city) && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span>
                    {business.address || `${business.city || ""}, ${business.state || ""}`}
                  </span>
                </span>
              )}
              {business.timezone && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span>Timezone: {business.timezone}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
          {business.phone && (
            <a
              href={`tel:${business.phone}`}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 font-medium hover:text-emerald-500 transition-colors"
            >
              <Phone className="h-3.5 w-3.5 text-emerald-500" />
              <span>{business.phone}</span>
            </a>
          )}
          {business.email && (
            <a
              href={`mailto:${business.email}`}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 font-medium hover:text-emerald-500 transition-colors"
            >
              <Mail className="h-3.5 w-3.5 text-teal-500" />
              <span>{business.email}</span>
            </a>
          )}
        </div>
      </div>
    );
  }

  // Default: Card variant
  return (
    <div
      className={`rounded-2xl border border-slate-200/70 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 p-5 backdrop-blur-md shadow-sm space-y-3.5 ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500/10 to-teal-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          {business.logoUrl ? (
            <img
              src={business.logoUrl}
              alt={business.name}
              className="h-full w-full rounded-xl object-cover"
            />
          ) : (
            <Building2 className="h-5 w-5" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Service Provider
          </p>
          <h4 className="truncate text-sm font-bold text-slate-900 dark:text-white">
            {business.name}
          </h4>
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-400">
        {business.category && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Industry</span>
            <span className="font-semibold text-foreground capitalize">
              {business.category}
            </span>
          </div>
        )}
        {(business.city || business.state) && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" /> Location
            </span>
            <span className="font-semibold text-foreground">
              {[business.city, business.state].filter(Boolean).join(", ")}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground flex items-center gap-1">
            <Globe className="h-3 w-3" /> Currency
          </span>
          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
            {business.currency}
          </span>
        </div>
      </div>
    </div>
  );
}
