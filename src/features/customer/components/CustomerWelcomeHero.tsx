"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Headset } from "lucide-react";

interface CustomerWelcomeHeroProps {
  firstName: string;
}

export const CustomerWelcomeHero = ({ firstName }: CustomerWelcomeHeroProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-emerald-500/5 to-teal-500/5 p-8 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-xl"
    >
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
        Welcome back, {firstName} 👋
      </h1>
      <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-xl">
        Here is a quick overview of your appointments, messages, and connected service providers.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/customer/services"
          className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors"
        >
          Explore Services
        </Link>
        <Link
          href="/customer/desk"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold transition-colors"
        >
          <Headset className="h-4 w-4" />
          <span>Go to Customer Desk</span>
        </Link>
      </div>
    </motion.div>
  );
};
