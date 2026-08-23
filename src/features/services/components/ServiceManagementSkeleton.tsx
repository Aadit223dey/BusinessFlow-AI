"use client";

export function ServiceManagementSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 rounded-xl bg-muted" />
          <div className="h-4 w-72 rounded-lg bg-muted" />
        </div>
        <div className="h-10 w-32 rounded-xl bg-muted" />
      </div>

      {/* Filter bar skeleton */}
      <div className="h-14 rounded-2xl bg-muted/60" />

      {/* Table skeleton */}
      <div className="rounded-2xl border border-border bg-card/60 p-4 space-y-4">
        <div className="h-10 rounded-xl bg-muted" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 rounded-xl bg-muted/40" />
        ))}
      </div>
    </div>
  );
}
