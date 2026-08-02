"use client";

import { motion } from "framer-motion";
import { Clock } from "lucide-react";

export const CustomerActivityFeed = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-6 flex flex-col h-full"
    >
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
        Recent Activity
      </h2>
      
      <div className="flex-1 flex flex-col items-center justify-center text-center py-8 border-l-2 border-dashed border-slate-200 dark:border-slate-700 ml-8 relative">
        <div className="absolute left-[-17px] top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
          <Clock className="w-4 h-4 text-slate-400" />
        </div>
        <div className="pl-6">
          <h3 className="text-base font-medium text-slate-900 dark:text-white mb-2">
            No recent activity to show.
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[250px]">
            Your profile updates, service completions, and account activity will appear here.
          </p>
        </div>
      </div>
    </motion.div>
  );
};
