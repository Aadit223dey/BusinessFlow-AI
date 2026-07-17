"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { motion } from "framer-motion";

/**
 * Refined Premium Action Control Primitive.
 *
 * Adds subtle gradient textures, interactive scaling metrics, and sharp focus states.
 * Uses Framer Motion for hardware-accelerated micro-elastic press feedback.
 */

export type ButtonVariant = "primary" | "secondary" | "outline" | "destructive";
export type ButtonSize = "sm" | "default" | "lg" | "icon";

export interface ButtonProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"
  > {
  /** Visual variant of the button */
  variant?: ButtonVariant;
  /** Size preset */
  size?: ButtonSize;
  /**
   * When true, renders children directly instead of wrapping in a <button>.
   */
  asChild?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-brand-primary to-indigo-600 text-primary-foreground hover:brightness-110 shadow-sm border border-indigo-500/10",
  secondary:
    "bg-muted text-foreground hover:bg-muted/80 shadow-sm border border-border/50",
  outline:
    "border border-border bg-transparent text-foreground hover:bg-muted/50",
  destructive:
    "bg-gradient-to-r from-destructive to-red-600 text-destructive-foreground hover:brightness-110 shadow-sm border border-red-500/10",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs rounded-md gap-1.5",
  default: "h-10 px-4 text-sm rounded-lg gap-2",
  lg: "h-12 px-6 text-base rounded-lg gap-2.5",
  icon: "h-10 w-10 rounded-lg",
};

const baseClasses = [
  "inline-flex items-center justify-center",
  "font-medium whitespace-nowrap",
  "transition-all duration-200 ease-out",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/20 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  "disabled:pointer-events-none disabled:opacity-50",
  "select-none cursor-pointer",
].join(" ");

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = "primary", size = "default", asChild = false, className = "", children, ...props },
    ref
  ) {
    const classes = [
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      className,
    ]
      .filter(Boolean)
      .join(" ");

    if (asChild) {
      return (
        <span className={classes} role="button" tabIndex={0}>
          {children}
        </span>
      );
    }

    return (
      <motion.button
        ref={ref}
        className={classes}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
