"use client";

export function ServiceDiscoverySkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col rounded-2xl border border-slate-200/70 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 p-5 backdrop-blur-md shadow-sm animate-pulse space-y-4"
        >
          {/* Header image / badge placeholder */}
          <div className="flex items-center justify-between">
            <div className="h-6 w-24 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="h-5 w-16 rounded-md bg-slate-200 dark:bg-slate-800" />
          </div>

          {/* Service Name & Description */}
          <div className="space-y-2 py-1">
            <div className="h-6 w-3/4 rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
          </div>

          {/* Business Info */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-800" />
          </div>

          {/* Footer: Duration & Price + CTA */}
          <div className="flex items-center justify-between pt-2">
            <div className="h-7 w-20 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-9 w-24 rounded-xl bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      ))}
    </div>
  );
}
