"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ui/theme-toggle";

/**
 * Centered Full-Bleed Authentication Wrapper Shell.
 *
 * Hosts the top-level premium canvas, displaying active mesh gradient components,
 * floating radial ambient blurs using will-change-transform for lag-free performance,
 * and an elevated glassmorphic card container.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen relative flex items-center justify-center bg-background text-foreground transition-all duration-300 overflow-hidden px-4 py-12">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      {/* Background Mesh Architecture */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Soft atmospheric gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(79,70,229,0.12),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.08),transparent_50%)]" />

        {/* Ambient floating radial blurs (using hardware accelerated motion) */}
        <motion.div
          animate={{
            x: [0, 40, -20, 0],
            y: [0, -30, 20, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
          style={{ willChange: "transform" }}
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-brand-primary/10 blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -30, 40, 0],
            y: [0, 40, -30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
          style={{ willChange: "transform" }}
          className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-brand-electric/10 blur-3xl"
        />
      </div>

      {/* Auth Panel Centered Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md bg-card/60 dark:bg-[#111827]/60 backdrop-blur-xl border border-white/10 shadow-premium rounded-2xl p-8 sm:p-10"
      >
        {/* Header Branding */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-brand-primary to-indigo-600 flex items-center justify-center border border-white/10 shadow-sm">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-white"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground animate-fade-in">
            BusinessFlow AI
          </span>
        </div>

        {children}
      </motion.div>
    </div>
  );
}
