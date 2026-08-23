"use client";

export function StaffManagementSkeleton() {
  return (
    <div className="space-y-8 animate-pulse w-full">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-4 w-full max-w-2xl">
          <div className="h-6 w-32 bg-muted rounded-full" />
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-muted rounded-md" />
            <div className="h-10 w-64 bg-muted rounded-md" />
          </div>
          <div className="h-4 w-full bg-muted rounded-md" />
          <div className="h-4 w-2/3 bg-muted rounded-md" />

          <div className="flex gap-3 pt-2">
            <div className="h-8 w-32 bg-muted rounded-md" />
            <div className="h-8 w-28 bg-muted rounded-md" />
            <div className="h-8 w-36 bg-muted rounded-md" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-10 bg-muted rounded-md" />
          <div className="h-10 w-32 bg-muted rounded-md" />
        </div>
      </div>

      {/* Toolbar Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-2 rounded-lg border border-border">
        <div className="flex w-full sm:w-1/2 gap-2">
          <div className="h-10 flex-1 bg-muted rounded-md" />
          <div className="h-10 w-32 bg-muted rounded-md" />
        </div>
        <div className="flex w-full sm:w-auto gap-2">
          <div className="h-9 w-16 bg-muted rounded-md" />
          <div className="h-9 w-16 bg-muted rounded-md" />
          <div className="h-9 w-16 bg-muted rounded-md" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="border border-border rounded-2xl bg-card overflow-hidden">
        <div className="h-12 bg-muted/50 border-b border-border px-4 flex items-center" />
        <div className="divide-y divide-border border-t-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4 w-full">
                <div className="h-10 w-10 shrink-0 rounded-full bg-muted" />
                <div className="space-y-2 flex-1 max-w-[200px]">
                  <div className="h-4 w-full bg-muted rounded" />
                  <div className="h-3 w-3/4 bg-muted rounded" />
                </div>
                <div className="hidden md:block h-4 w-24 bg-muted rounded mx-auto" />
                <div className="h-6 w-20 bg-muted rounded-full mx-auto" />
                <div className="h-8 w-8 bg-muted rounded-md shrink-0 ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
