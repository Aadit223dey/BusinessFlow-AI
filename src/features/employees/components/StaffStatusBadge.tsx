"use client";

import { EmploymentStatus, EMPLOYMENT_STATUS_OPTIONS } from "@/types/staff";
import { cn } from "@/lib/utils";

interface StaffStatusBadgeProps {
  status: EmploymentStatus;
  size?: "sm" | "default";
  className?: string;
}

export function StaffStatusBadge({ status, size = "default", className }: StaffStatusBadgeProps) {
  const option = EMPLOYMENT_STATUS_OPTIONS.find((o) => o.value === status);
  const label = option?.label || status;

  const colorVariants: Record<EmploymentStatus, string> = {
    ACTIVE: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    INACTIVE: "bg-muted text-muted-foreground border-border",
    ON_LEAVE: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    SUSPENDED: "bg-destructive/10 text-destructive border-destructive/20",
  };

  const dotVariants: Record<EmploymentStatus, string> = {
    ACTIVE: "bg-emerald-500",
    INACTIVE: "bg-muted-foreground",
    ON_LEAVE: "bg-amber-500",
    SUSPENDED: "bg-destructive",
  };

  return (
    <span
      className={cn(
        "font-semibold inline-flex items-center gap-1.5 rounded-full border",
        colorVariants[status] || colorVariants.INACTIVE,
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs sm:text-sm",
        className
      )}
    >
      <span
        className={cn(
          "rounded-full",
          dotVariants[status] || dotVariants.INACTIVE,
          size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2"
        )}
      />
      {label}
    </span>
  );
}
