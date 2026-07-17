"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

/**
 * Client-side error page using the Next.js error boundary pattern.
 *
 * Catches runtime errors at the route segment level and provides
 * a recovery mechanism.
 */

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Route Error]", error);
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="text-center animate-fade-in">
        <div className="mb-6 flex items-center justify-center h-16 w-16 mx-auto rounded-2xl bg-destructive/10 text-destructive">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        <h2 className="text-lg font-semibold text-foreground mb-2">
          Something went wrong
        </h2>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6 leading-relaxed">
          An error occurred while rendering this page. You can try again or
          navigate back to continue.
        </p>

        <Button variant="primary" size="default" onClick={reset}>
          Try Again
        </Button>
      </div>
    </div>
  );
}
