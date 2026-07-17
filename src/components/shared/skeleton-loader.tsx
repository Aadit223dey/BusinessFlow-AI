/**
 * Animated pulse skeleton placeholder.
 *
 * Configurable dimensions and shape variants for loading states.
 */

export interface SkeletonLoaderProps {
  /** Width class (e.g., "w-full", "w-48") */
  width?: string;
  /** Height class (e.g., "h-4", "h-10") */
  height?: string;
  /** Shape variant */
  variant?: "rectangular" | "circular" | "text";
  /** Additional CSS classes */
  className?: string;
  /** Number of skeleton lines to render (for text variant) */
  lines?: number;
}

const shapeClasses: Record<string, string> = {
  rectangular: "rounded-lg",
  circular: "rounded-full",
  text: "rounded-md",
};

export function SkeletonLoader({
  width = "w-full",
  height = "h-4",
  variant = "rectangular",
  className = "",
  lines = 1,
}: SkeletonLoaderProps) {
  if (variant === "text" && lines > 1) {
    return (
      <div className={`space-y-3 ${className}`} role="status" aria-label="Loading content">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`animate-pulse-soft bg-muted ${shapeClasses.text} ${
              i === lines - 1 ? "w-3/4" : width
            } ${height}`}
          />
        ))}
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  return (
    <div role="status" aria-label="Loading content">
      <div
        className={`animate-pulse-soft bg-muted ${shapeClasses[variant]} ${width} ${height} ${className}`}
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
