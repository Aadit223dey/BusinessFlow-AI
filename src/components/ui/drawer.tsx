"use client";

import {
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
  type MouseEvent,
} from "react";
import { createPortal } from "react-dom";

/**
 * Slide-in panel drawer component.
 *
 * Features:
 * - Slides in from the right edge
 * - Portal-rendered
 * - Escape key to close
 * - Backdrop click to close
 * - Smooth slide transition animations
 */

export interface DrawerProps {
  /** Whether the drawer is open */
  isOpen: boolean;
  /** Callback to close the drawer */
  onClose: () => void;
  /** Drawer title for accessibility */
  title: string;
  /** Optional description text */
  description?: string;
  /** Drawer body content */
  children: ReactNode;
  /** Width class override (default: "max-w-md") */
  widthClass?: string;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  widthClass = "max-w-md",
}: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Store and restore focus
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      const timer = setTimeout(() => {
        drawerRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [isOpen]);

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  // Trap focus and handle escape key globally
  useEffect(() => {
    if (!isOpen) return;

    const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === "Tab" && drawerRef.current) {
        const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const focusableElements = Array.from(focusable).filter(
          (el) => !el.hasAttribute("disabled") && el.tabIndex !== -1
        );

        if (focusableElements.length === 0) {
          e.preventDefault();
          return;
        }

        const firstEl = focusableElements[0];
        const lastEl = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstEl) {
            lastEl.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastEl) {
            firstEl.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [isOpen, onClose]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex justify-end bg-overlay animate-fade-in"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        aria-describedby={description ? "drawer-description" : undefined}
        tabIndex={-1}
        className={`relative w-full ${widthClass} h-full bg-card text-card-foreground border-l border-border shadow-2xl animate-slide-in-right focus:outline-none flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2 shrink-0">
          <h2
            id="drawer-title"
            className="text-lg font-semibold text-foreground"
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
            aria-label="Close drawer"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="4" y1="4" x2="12" y2="12" />
              <line x1="12" y1="4" x2="4" y2="12" />
            </svg>
          </button>
        </div>

        {/* Description */}
        {description && (
          <p
            id="drawer-description"
            className="px-6 pb-2 text-sm text-muted-foreground shrink-0"
          >
            {description}
          </p>
        )}

        {/* Body */}
        <div className="px-6 pb-6 pt-2 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body
  );
}
