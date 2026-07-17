import { Button } from "@/components/ui/button";

/**
 * Stitch Empty State Protocol
 *
 * Displays context-appropriate visual layouts containing clean graphics,
 * direct status explanations, and action triggers when zero-value data
 * states occur.
 */

export interface EmptyStateProps {
  /** Primary heading text */
  title: string;
  /** Supporting description text */
  description: string;
  /** Optional action button label */
  actionLabel?: string;
  /** Callback when the action button is triggered */
  onActionTrigger?: () => void;
  /** Optional custom icon — defaults to a built-in placeholder icon */
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onActionTrigger,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      {/* Icon */}
      <div className="mb-6 flex items-center justify-center h-16 w-16 rounded-2xl bg-muted text-muted-foreground">
        {icon ?? (
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
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <path d="M12 8v4m0 4h.01" />
          </svg>
        )}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>

      {/* Description */}
      <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {/* Action Button */}
      {actionLabel && onActionTrigger && (
        <Button variant="primary" size="default" onClick={onActionTrigger}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
