"use client";

interface ServiceStatusBadgeProps {
  isActive: boolean;
  className?: string;
}

export function ServiceStatusBadge({ isActive, className = "" }: ServiceStatusBadgeProps) {
  if (isActive) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 ${className}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        <span>Active</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 text-xs font-semibold text-slate-500 dark:text-slate-400 ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
      <span>Inactive</span>
    </span>
  );
}
