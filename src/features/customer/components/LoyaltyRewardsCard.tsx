"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Gift } from "lucide-react";

export const LoyaltyRewardsCard = () => {
  useEffect(() => {
    console.log("🔍 [DIAGNOSTIC] Widget Rendered:", {
      widgetName: "LoyaltyRewardsCard",
      status: "static / success",
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500/10 to-orange-500/10 flex items-center justify-center shrink-0">
          <Gift className="w-8 h-8 text-amber-500" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Loyalty & Rewards
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
              Coming Soon
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
            Earn points with every booking. Track rewards and redeem exclusive offers from your favorite providers.
          </p>
        </div>
      </div>
    </motion.div>
  );
};
