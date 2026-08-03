"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { CalendarCheck } from "lucide-react";
import Link from "next/link";
import { useCustomerAppointments } from "@/features/customer/hooks/use-customer-queries";

interface UpcomingAppointmentsCardProps {
  userId?: string;
}

export const UpcomingAppointmentsCard = ({ userId }: UpcomingAppointmentsCardProps) => {
  const { data: appointments, status } = useCustomerAppointments(userId);

  useEffect(() => {
    console.log("🔍 [DIAGNOSTIC 7/7] Widget Mounted:", {
      widgetName: "UpcomingAppointmentsCard",
      status,
      dataLength: appointments?.length ?? 0,
    });
  }, [status, appointments]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-6 flex flex-col h-full"
    >
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
        Upcoming Appointments
      </h2>

      {(!appointments || appointments.length === 0) ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 flex items-center justify-center mb-4">
            <CalendarCheck className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-base font-medium text-slate-900 dark:text-white mb-2">
            No upcoming bookings
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-[250px]">
            Ready for a self-care or service session?
          </p>
          <Link
            href="/customer/services"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-medium transition-colors text-sm"
          >
            Browse Services
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((apt) => (
            <div key={apt.id} className="p-3 rounded-xl border border-border/50 bg-muted/40">
              <p className="text-sm font-bold text-foreground">{apt.service_name || 'Service Booking'}</p>
              <p className="text-xs text-muted-foreground">{apt.start_time || 'Scheduled'}</p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
