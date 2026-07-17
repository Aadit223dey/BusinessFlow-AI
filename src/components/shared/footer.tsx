"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

/**
 * Elegant, minimal footer component following Stitch Design System guidelines.
 * Displays dynamic copyright year and social profile links with accessible,
 * smooth scaling hover transitions.
 */
export function Footer() {
  const [year, setYear] = useState<number>(2026); // Fallback to current year of metadata

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="w-full border-t border-border/40 bg-card/10 py-6 px-6 sm:px-8 mt-auto backdrop-blur-md">
      <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        {/* Developed Credits */}
        <p className="text-xs font-medium text-muted-foreground tracking-wide">
          &copy; {year} Developed By{" "}
          <span className="text-foreground font-semibold hover:text-brand-primary transition-colors duration-200">
            Aadit Dey
          </span>
        </p>

        {/* Social Profile Links */}
        <div className="flex items-center gap-5">
          {/* GitHub link */}
          <motion.a
            href="https://github.com/Aadit223dey"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-border/50 bg-card/50 text-muted-foreground transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            whileHover={{ scale: 1.08, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Aadit Dey's GitHub profile"
          >
            <svg
              className="h-4.5 w-4.5 group-hover:text-foreground transition-colors duration-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
          </motion.a>

          {/* LinkedIn link */}
          <motion.a
            href="https://www.linkedin.com/in/aadit-dey-82b9203a2"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-border/50 bg-card/50 text-muted-foreground transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            whileHover={{ scale: 1.08, rotate: -2 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Aadit Dey's LinkedIn profile"
          >
            <svg
              className="h-4.5 w-4.5 group-hover:text-[#0A66C2] transition-colors duration-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
              <rect x="2" y="9" width="4" height="12" />
              <circle cx="4" cy="4" r="2" />
            </svg>
          </motion.a>
        </div>
      </div>
    </footer>
  );
}
