"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Micro-Animated Theme Control Selector
 *
 * Exposes the interactive light/dark mode selection control element,
 * passing state changes to next-themes. Incorporates subtle 3D hover
 * rotation parameters and micro-scaling mechanics on click.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`h-10 w-10 rounded-lg border border-border/50 bg-card/50 ${className}`}
        aria-hidden="true"
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <motion.button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-border/50 bg-card/50 text-foreground transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/20 ${className}`}
      whileHover={{ scale: 1.05, rotateY: 15, rotateX: -5 }}
      whileTap={{ scale: 0.95 }}
      style={{ transformStyle: "preserve-3d" }}
      aria-label="Toggle visual theme"
    >
      {/* Sun Icon (shown in light mode, rotates away in dark) */}
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 90 : 0, scale: isDark ? 0 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="absolute flex items-center justify-center backface-hidden"
      >
        <Sun className="h-5 w-5 text-amber-500" />
      </motion.div>

      {/* Moon Icon (shown in dark mode, rotates in from -90) */}
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 0 : -90, scale: isDark ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="absolute flex items-center justify-center backface-hidden"
      >
        <Moon className="h-5 w-5 text-indigo-400" />
      </motion.div>
    </motion.button>
  );
}
