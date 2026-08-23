"use client";

import * as React from "react";

// ── Context ──────────────────────────────────────────────
interface DropdownMenuContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}
const DropdownMenuContext = React.createContext<DropdownMenuContextType>({
  isOpen: false,
  setIsOpen: () => {},
});

// ── Root ─────────────────────────────────────────────────
function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Close on outside click
  const containerRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  return (
    <DropdownMenuContext.Provider value={{ isOpen, setIsOpen }}>
      <div ref={containerRef} className="relative inline-block text-left">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
}

// ── Trigger ──────────────────────────────────────────────
function DropdownMenuTrigger({ children, asChild, ...props }: { children: React.ReactNode; asChild?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { isOpen, setIsOpen } = React.useContext(DropdownMenuContext);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: (e: React.MouseEvent) => {
        setIsOpen(!isOpen);
        (children as any).props?.onClick?.(e);
      },
    });
  }

  return (
    <button type="button" onClick={() => setIsOpen(!isOpen)} {...props}>
      {children}
    </button>
  );
}

// ── Content ──────────────────────────────────────────────
function DropdownMenuContent({
  children,
  align = "end",
  className = "",
}: {
  children: React.ReactNode;
  align?: "start" | "end" | "center";
  className?: string;
  sideOffset?: number;
}) {
  const { isOpen, setIsOpen } = React.useContext(DropdownMenuContext);
  if (!isOpen) return null;

  const alignClass = align === "start" ? "left-0" : align === "end" ? "right-0" : "left-1/2 -translate-x-1/2";

  return (
    <div
      className={`absolute z-50 mt-1 min-w-[180px] overflow-hidden rounded-xl border border-border bg-card p-1 shadow-lg animate-in fade-in-0 zoom-in-95 ${alignClass} ${className}`}
      onClick={() => setIsOpen(false)}
    >
      {children}
    </div>
  );
}

// ── Label ────────────────────────────────────────────────
function DropdownMenuLabel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`px-2 py-1.5 text-xs font-semibold text-muted-foreground ${className}`}>
      {children}
    </div>
  );
}

// ── Item ─────────────────────────────────────────────────
function DropdownMenuItem({
  children,
  onClick,
  className = "",
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`relative flex w-full cursor-pointer select-none items-center rounded-lg px-2 py-2 text-sm font-medium transition-colors hover:bg-muted focus:bg-muted outline-none disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}

// ── Separator ────────────────────────────────────────────
function DropdownMenuSeparator() {
  return <div className="-mx-1 my-1 h-px bg-border" />;
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
};
