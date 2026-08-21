"use client";

import { useState } from "react";
import { ServiceDiscoveryItem } from "@/types/discovery";
import { Button } from "@/components/ui/button";
import {
  CalendarCheck,
  Clock,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Info,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ServicePricingCardProps {
  service: ServiceDiscoveryItem;
}

export function ServicePricingCard({ service }: ServicePricingCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  return (
    <>
      <div className="sticky top-24 rounded-3xl border border-slate-200/70 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 p-6 sm:p-7 backdrop-blur-xl shadow-xl space-y-6">
        {/* Price Box */}
        <div className="space-y-1 pb-4 border-b border-slate-100 dark:border-slate-800">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Total Service Investment
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {formatPrice(service.price, service.currency)}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              / session
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 pt-1 font-medium">
            <Clock className="h-3.5 w-3.5" />
            <span>Estimated Duration: {service.durationMinutes} minutes</span>
          </div>
        </div>

        {/* Primary CTA */}
        <div className="space-y-3">
          <Button
            size="lg"
            variant="primary"
            onClick={() => setIsModalOpen(true)}
            className="w-full rounded-2xl py-6 text-base font-extrabold gap-2 shadow-lg shadow-emerald-500/25 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500"
          >
            <CalendarCheck className="h-5 w-5" />
            <span>Book Appointment</span>
          </Button>

          <p className="text-center text-[11px] text-muted-foreground">
            Directly scheduled with {service.business.name}
          </p>
        </div>

        {/* Service Highlights */}
        <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>Instant booking confirmation</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-teal-500 shrink-0" />
            <span>Verified business provider</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
            <span>Client protection & quality guarantee</span>
          </div>
        </div>
      </div>

      {/* Booking Notice Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl z-10 space-y-5"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute right-4 top-4 rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <CalendarCheck className="h-7 w-7" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Booking Integration Ready
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Online real-time time slot scheduling for <strong>{service.name}</strong> is activating in the upcoming sprint.
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs space-y-2">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold">
                  <Info className="h-4 w-4 shrink-0" />
                  <span>Targeted Provider Details</span>
                </div>
                <div className="text-slate-600 dark:text-slate-400 space-y-1 font-mono text-[11px]">
                  <div>Business: <strong className="text-foreground">{service.business.name}</strong></div>
                  <div>Tenant ID: <strong className="text-foreground">{service.tenantId}</strong></div>
                  <div>Service ID: <strong className="text-foreground">{service.id}</strong></div>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  className="w-full rounded-xl py-2.5 font-bold"
                  onClick={() => setIsModalOpen(false)}
                >
                  Understood
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
