"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Store } from "lucide-react";
import { useCustomerConnectedBusinesses } from "@/features/customer/hooks/use-customer-queries";

interface ConnectedBusinessesGridProps {
  userId?: string;
}

export const ConnectedBusinessesGrid = ({ userId }: ConnectedBusinessesGridProps) => {
  const { data: businesses, status } = useCustomerConnectedBusinesses(userId);

  useEffect(() => {
    console.log("🔍 [DIAGNOSTIC] Widget Rendered:", {
      widgetName: "ConnectedBusinessesGrid",
      status: `${status} / initialData`,
      count: businesses?.length || 0,
    });
  }, [status, businesses]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-6"
    >
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
        Connected Businesses
      </h2>
      
      {(!businesses || businesses.length === 0) ? (
        <div className="flex flex-col items-center justify-center text-center py-10 bg-slate-50/50 dark:bg-slate-800/20 rounded-xl border border-slate-100 dark:border-slate-800/50">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-500/10 to-pink-500/10 flex items-center justify-center mb-4">
            <Store className="w-8 h-8 text-purple-500" />
          </div>
          <h3 className="text-base font-medium text-slate-900 dark:text-white mb-2 max-w-md">
            You haven't connected with any local businesses yet.
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Complete a booking or setup to see your connections here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {businesses.map((biz) => (
            <div key={biz.id} className="p-4 rounded-xl border border-border/50 bg-muted/30">
              <p className="text-sm font-bold text-foreground">{biz.name}</p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
