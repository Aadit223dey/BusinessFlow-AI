"use client";

import { Toaster as SonnerToaster, toast } from "sonner";

/**
 * Toast notification system.
 *
 * Thin wrapper around Sonner toast library providing theme-aware
 * styling and consistent positioning. Re-exports the `toast` function
 * and a pre-configured `<Toaster>` component.
 */

export interface ToasterProps {
  /** Position of toast notifications */
  position?:
    | "top-left"
    | "top-right"
    | "top-center"
    | "bottom-left"
    | "bottom-right"
    | "bottom-center";
}

export function Toaster({ position = "bottom-right" }: ToasterProps) {
  return (
    <SonnerToaster
      position={position}
      expand={false}
      richColors
      closeButton
      toastOptions={{
        duration: 4000,
        classNames: {
          toast:
            "bg-card text-card-foreground border-border shadow-lg rounded-lg",
          title: "font-semibold text-sm",
          description: "text-muted-foreground text-sm",
          closeButton:
            "text-muted-foreground hover:text-foreground transition-colors",
        },
      }}
    />
  );
}

export { toast };
