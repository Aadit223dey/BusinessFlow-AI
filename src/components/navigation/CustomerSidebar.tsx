"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  Briefcase,
  ShoppingBag,
  FileText,
  MessageSquare,
  Bell,
  UserCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";
import { useSidebarStore } from "@/hooks/use-sidebar-store";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { name: "Dashboard", href: "/customer/dashboard", icon: LayoutDashboard },
  { name: "Appointments", href: "/customer/appointments", icon: CalendarCheck },
  { name: "Services", href: "/customer/services", icon: Briefcase },
  { name: "Orders", href: "/customer/orders", icon: ShoppingBag },
  { name: "Invoices", href: "/customer/invoices", icon: FileText },
  { name: "Messages", href: "/customer/messages", icon: MessageSquare },
  { name: "Notifications", href: "/customer/notifications", icon: Bell },
  { name: "Profile", href: "/customer/profile", icon: UserCircle },
  { name: "Settings", href: "/customer/settings", icon: Settings },
];

export function CustomerSidebar() {
  const pathname = usePathname();
  const { isCollapsed, isMobileOpen, toggleSidebar, closeMobile } = useSidebarStore();

  return (
    <>
      {/* ─── Mobile Drawer Backdrop Overlay ─────────────────────────────── */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMobile}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* ─── Sidebar Navigation Container ─────────────────────────────── */}
      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-border/60 bg-card/90 backdrop-blur-xl transition-all duration-300 ease-in-out
          ${isCollapsed ? "w-[72px]" : "w-[260px]"}
          ${isMobileOpen ? "translate-x-0 w-[260px]" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Header Branding */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border/40 px-4">
          <Link
            href="/customer/dashboard"
            onClick={closeMobile}
            className="flex items-center gap-3 overflow-hidden"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 border border-white/10 shadow-sm">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-white"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            {!isCollapsed && (
              <span className="font-bold text-sm text-foreground tracking-tight whitespace-nowrap animate-fade-in">
                Client Portal
              </span>
            )}
          </Link>

          {/* Close mobile button */}
          <button
            onClick={closeMobile}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
            aria-label="Close Mobile Sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Link List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/customer/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobile}
                title={isCollapsed ? item.name : undefined}
                className={`
                  group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-200
                  ${
                    isActive
                      ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/25"
                      : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                  }
                  ${isCollapsed ? "justify-center px-0" : ""}
                `}
              >
                <Icon
                  className={`h-4.5 w-4.5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground"
                  }`}
                />

                {!isCollapsed && (
                  <span className="truncate flex-1">{item.name}</span>
                )}

                {/* Collapsed active dot indicator */}
                {isCollapsed && isActive && (
                  <span className="absolute right-1 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-white" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Desktop Collapse Toggle Footer */}
        <div className="hidden border-t border-border/40 p-3 lg:block">
          <button
            onClick={toggleSidebar}
            className="flex w-full items-center justify-center rounded-xl border border-border/50 bg-card p-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <div className="flex items-center gap-2">
                <ChevronLeft className="h-4 w-4" />
                <span>Collapse Sidebar</span>
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
