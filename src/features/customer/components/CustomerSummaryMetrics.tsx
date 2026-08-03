"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { CalendarCheck, CheckCircle, Building2, FileText } from "lucide-react";

interface CustomerSummaryMetricsProps {
  stats?: {
    upcomingBookings?: number;
    completedServices?: number;
    connectedBusinesses?: number;
    activeInvoices?: number;
  };
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export const CustomerSummaryMetrics = ({ stats }: CustomerSummaryMetricsProps) => {
  const upcomingBookings = stats?.upcomingBookings ?? 0;
  const completedServices = stats?.completedServices ?? 0;
  const connectedBusinesses = stats?.connectedBusinesses ?? 0;
  const activeInvoices = stats?.activeInvoices ?? 0;

  useEffect(() => {
    console.log("🔍 [DIAGNOSTIC 7/7] Widget Mounted:", {
      widgetName: "CustomerSummaryMetrics",
      status: "success (defaults 0)",
      dataLength: 4,
    });
  }, []);

  const cards = [
    {
      title: "Upcoming Bookings",
      value: upcomingBookings,
      icon: CalendarCheck,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      zeroText: "No bookings scheduled",
    },
    {
      title: "Completed Services",
      value: completedServices,
      icon: CheckCircle,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      zeroText: "Start exploring services",
    },
    {
      title: "Connected Businesses",
      value: connectedBusinesses,
      icon: Building2,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      zeroText: "Connect with providers",
    },
    {
      title: "Active Invoices",
      value: activeInvoices,
      icon: FileText,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      zeroText: "All clear!",
    },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {cards.map((card, index) => (
        <motion.div
          key={index}
          variants={item}
          className="rounded-2xl bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-5"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-full ${card.bgColor}`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
            <h3 className="font-medium text-slate-600 dark:text-slate-300 text-sm">
              {card.title}
            </h3>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
              {card.value}
            </div>
            {card.value === 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {card.zeroText}
              </p>
            )}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};
