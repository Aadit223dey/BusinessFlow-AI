import { forwardRef, type InputHTMLAttributes } from "react";

/**
 * Styled text input with consistent sizing, focus ring states,
 * and error state variant.
 */

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Shows error styling when true */
  hasError?: boolean;
}

const baseClasses = [
  "flex w-full h-10 rounded-lg border bg-transparent px-3 py-2",
  "text-sm text-foreground placeholder:text-muted-foreground",
  "transition-all duration-150 ease-out",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  "disabled:cursor-not-allowed disabled:opacity-50",
  "file:border-0 file:bg-transparent file:text-sm file:font-medium",
].join(" ");

const defaultBorderClass = "border-border";
const errorBorderClass = "border-destructive focus-visible:ring-destructive/20";

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ hasError = false, className = "", ...props }, ref) {
    const borderClass = hasError ? errorBorderClass : defaultBorderClass;

    return (
      <input
        ref={ref}
        className={`${baseClasses} ${borderClass} ${className}`}
        {...props}
      />
    );
  }
);
