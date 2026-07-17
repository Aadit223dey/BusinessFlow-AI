import { SkeletonLoader } from "@/components/shared/skeleton-loader";

/**
 * Root loading fallback for Suspense boundaries.
 *
 * Displays skeleton placeholders while the page content is loading.
 */

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8 gap-6">
      <SkeletonLoader variant="circular" width="w-16" height="h-16" />
      <div className="w-full max-w-sm space-y-3">
        <SkeletonLoader variant="text" width="w-3/4" height="h-5" className="mx-auto" />
        <SkeletonLoader variant="text" width="w-full" height="h-4" />
        <SkeletonLoader variant="text" width="w-5/6" height="h-4" />
      </div>
    </div>
  );
}
