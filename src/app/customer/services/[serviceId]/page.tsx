"use client";

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useServiceDetails } from "@/features/customer/hooks/use-service-details";
import { ServiceDetailHeader } from "@/features/customer/discovery/components/ServiceDetailHeader";
import { ServicePricingCard } from "@/features/customer/discovery/components/ServicePricingCard";
import { BusinessDetailBadge } from "@/features/customer/discovery/components/BusinessDetailBadge";
import { CustomerErrorBoundary } from "@/components/shared/CustomerErrorBoundary";
import { CustomerEmptyState } from "@/components/shared/CustomerEmptyState";
import {
  Clock,
  ShieldCheck,
  Calendar,
  Layers,
  Sparkles,
  FileQuestion,
} from "lucide-react";

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = typeof params?.serviceId === "string" ? params.serviceId : "";

  const { data: service, isLoading } = useServiceDetails(serviceId);

  if (isLoading) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto w-full animate-pulse p-4">
        <div className="h-64 rounded-3xl bg-slate-200/70 dark:bg-slate-800/70" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-48 rounded-2xl bg-slate-200/70 dark:bg-slate-800/70" />
            <div className="h-48 rounded-2xl bg-slate-200/70 dark:bg-slate-800/70" />
          </div>
          <div className="h-96 rounded-2xl bg-slate-200/70 dark:bg-slate-800/70" />
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <CustomerEmptyState
          icon={FileQuestion}
          title="Service Not Found"
          description="The service you are looking for may have been archived or is temporarily unavailable."
          actionLabel="Back to Service Catalog"
          onAction={() => router.push("/customer/services")}
        />
      </div>
    );
  }

  return (
    <CustomerErrorBoundary moduleName="Service Details View">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-8 max-w-7xl mx-auto w-full pb-16"
      >
        {/* Full-width presentation header */}
        <ServiceDetailHeader service={service} />

        {/* 2-Column Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Details (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description & Overview */}
            <div className="rounded-3xl border border-slate-200/70 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 p-6 sm:p-8 backdrop-blur-md shadow-sm space-y-4">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-500" />
                <span>Service Overview</span>
              </h2>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {service.description ||
                  "This professional service is provided with full satisfaction guarantee and dedicated client care. Customize your booking details during checkout."}
              </p>

              {/* Service specs checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase">Session Time</p>
                    <p className="text-sm font-bold text-foreground">{service.durationMinutes} Minutes</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase">Category</p>
                    <p className="text-sm font-bold text-foreground">
                      {service.category?.name || "General Service"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase">Quality Standard</p>
                    <p className="text-sm font-bold text-foreground">Verified Provider</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase">Booking Availability</p>
                    <p className="text-sm font-bold text-foreground">Direct Provider Sync</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Provider Credentials & Location */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white px-1">
                About the Service Provider
              </h3>
              <BusinessDetailBadge business={service.business} variant="banner" />
            </div>
          </div>

          {/* Sticky Sidebar Pricing & Action Card (1 col) */}
          <div className="lg:col-span-1">
            <ServicePricingCard service={service} />
          </div>
        </div>
      </motion.div>
    </CustomerErrorBoundary>
  );
}
