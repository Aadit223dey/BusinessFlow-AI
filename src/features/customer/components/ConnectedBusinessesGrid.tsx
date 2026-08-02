"use client";

import { motion } from "framer-motion";
import { Store } from "lucide-react";

export const ConnectedBusinessesGrid = () => {
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
    </motion.div>
  );
};
