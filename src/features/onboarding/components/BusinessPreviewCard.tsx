"use client";

import { useMemo } from "react";
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Globe,
  Clock,
  CalendarClock,
  ImagePlus,
} from "lucide-react";
import type { OnboardingFormData } from "@/features/onboarding/schemas/onboarding-schemas";
import { CURRENCIES } from "@/features/onboarding/schemas/onboarding-schemas";

/**
 * Real-Time Business Preview Card
 *
 * Renders a live-updating preview panel reflecting user inputs
 * (business name, logo, currency, hours, etc.) as they are
 * entered in the adjacent wizard steps. Client-side only.
 */

interface BusinessPreviewCardProps {
  data: OnboardingFormData;
  logoPreviewUrl: string | null;
}

export function BusinessPreviewCard({
  data,
  logoPreviewUrl,
}: BusinessPreviewCardProps) {
  const currencySymbol = useMemo(() => {
    const match = CURRENCIES.find(
      (c) => c.code === data.regionalSettings.currency
    );
    return match?.symbol ?? "$";
  }, [data.regionalSettings.currency]);

  const activeDaysCount = useMemo(() => {
    return Object.values(data.workingHours).filter((d) => d.enabled).length;
  }, [data.workingHours]);

  const businessName =
    data.businessIdentity.businessName || "Your Business";
  const category = data.businessIdentity.category || "Category";
  const hasAddress =
    data.businessAddress.city && data.businessAddress.state;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 shadow-2xl">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full bg-brand-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-brand-electric/10 blur-3xl" />

      {/* Header with logo */}
      <div className="relative mb-6 flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5">
          {logoPreviewUrl ? (
            <img
              src={logoPreviewUrl}
              alt="Business logo preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <ImagePlus className="h-7 w-7 text-slate-500" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold text-white transition-all duration-200">
            {businessName}
          </h3>
          <span className="inline-block rounded-full bg-brand-primary/15 px-2.5 py-0.5 text-xs font-medium text-brand-primary transition-all duration-200">
            {category}
          </span>
        </div>
      </div>

      {/* Info grid */}
      <div className="space-y-3">
        {/* Contact */}
        {(data.contactInfo.email || data.contactInfo.phone) && (
          <div className="space-y-2">
            {data.contactInfo.email && (
              <div className="flex items-center gap-2.5 text-sm text-slate-400">
                <Mail className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                <span className="truncate">{data.contactInfo.email}</span>
              </div>
            )}
            {data.contactInfo.phone && (
              <div className="flex items-center gap-2.5 text-sm text-slate-400">
                <Phone className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                <span>{data.contactInfo.phone}</span>
              </div>
            )}
          </div>
        )}

        {/* Address */}
        {hasAddress && (
          <div className="flex items-start gap-2.5 text-sm text-slate-400">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />
            <span>
              {[
                data.businessAddress.addressLine1,
                data.businessAddress.city,
                data.businessAddress.state,
                data.businessAddress.postalCode,
              ]
                .filter(Boolean)
                .join(", ")}
            </span>
          </div>
        )}

        {/* Separator */}
        <div className="border-t border-white/5 pt-3">
          <div className="grid grid-cols-2 gap-3">
            {/* Currency */}
            <div className="rounded-lg bg-white/5 p-3">
              <div className="mb-1 flex items-center gap-1.5 text-xs text-slate-500">
                <Globe className="h-3 w-3" />
                Currency
              </div>
              <span className="text-sm font-medium text-white">
                {currencySymbol} {data.regionalSettings.currency}
              </span>
            </div>

            {/* Timezone */}
            <div className="rounded-lg bg-white/5 p-3">
              <div className="mb-1 flex items-center gap-1.5 text-xs text-slate-500">
                <Clock className="h-3 w-3" />
                Timezone
              </div>
              <span className="text-sm font-medium text-white truncate block">
                {data.regionalSettings.timezone.split("/").pop()?.replace(/_/g, " ") || "—"}
              </span>
            </div>

            {/* Working days */}
            <div className="rounded-lg bg-white/5 p-3">
              <div className="mb-1 flex items-center gap-1.5 text-xs text-slate-500">
                <Building2 className="h-3 w-3" />
                Working Days
              </div>
              <span className="text-sm font-medium text-white">
                {activeDaysCount} days/week
              </span>
            </div>

            {/* Appointment */}
            <div className="rounded-lg bg-white/5 p-3">
              <div className="mb-1 flex items-center gap-1.5 text-xs text-slate-500">
                <CalendarClock className="h-3 w-3" />
                Slot Duration
              </div>
              <span className="text-sm font-medium text-white">
                {data.appointmentSettings.appointmentDuration} min
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer status */}
      <div className="mt-4 rounded-lg border border-brand-primary/20 bg-brand-primary/5 p-3 text-center">
        <p className="text-xs text-brand-primary/80">
          Live Preview — Updates as you configure
        </p>
      </div>
    </div>
  );
}
