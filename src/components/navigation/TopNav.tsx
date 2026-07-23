"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Menu,
  Search,
  Bell,
  ChevronRight,
  LogOut,
  User as UserIcon,
  Building2,
} from "lucide-react";
import { useSidebarStore } from "@/hooks/use-sidebar-store";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/toast";
import { motion, AnimatePresence } from "framer-motion";

interface TopNavProps {
  tenantName?: string;
  userName?: string;
  userEmail?: string;
  userRole?: string;
}

export function TopNav({
  tenantName = "My Workspace",
  userName = "Workspace User",
  userEmail = "",
  userRole = "ADMIN",
}: TopNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { openMobile, isCollapsed } = useSidebarStore();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Generate dynamic breadcrumbs from current pathname
  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, idx) => {
    const href = "/" + pathSegments.slice(0, idx + 1).join("/");
    const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
    return { href, label };
  });

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "U";

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error("Logout failed", { description: error.message });
      } else {
        toast.success("Logged out successfully");
        router.push("/login");
        router.refresh();
      }
    } catch (err) {
      console.error("Signout error:", err);
      toast.error("An unexpected error occurred during logout");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <header
        className={`
          fixed top-0 right-0 z-30 flex h-16 items-center justify-between border-b border-border/60 bg-card/70 px-4 sm:px-6 backdrop-blur-md transition-all duration-300
          ${isCollapsed ? "left-0 lg:left-[72px]" : "left-0 lg:left-[260px]"}
        `}
      >
        {/* Left Section: Mobile Menu Trigger + Breadcrumb Trail */}
        <div className="flex items-center gap-3">
          <button
            onClick={openMobile}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/50 bg-card text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
            aria-label="Open Navigation Menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Breadcrumb Navigation */}
          <nav className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link
              href="/dashboard"
              className="hover:text-foreground transition-colors font-medium"
            >
              BusinessFlow
            </Link>
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <div key={crumb.href} className="flex items-center gap-1.5">
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
                  {isLast ? (
                    <span className="font-bold text-foreground">{crumb.label}</span>
                  ) : (
                    <Link
                      href={crumb.href}
                      className="hover:text-foreground transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Right Section: Command Search, Notifications, Theme Toggle & Profile Menu */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Cmd+K Global Search Trigger */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex h-9 items-center gap-2.5 rounded-xl border border-border/60 bg-muted/40 px-3 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground transition-all"
            aria-label="Search Workspace"
          >
            <Search className="h-4 w-4" />
            <span className="hidden md:inline">Search modules...</span>
            <kbd className="hidden md:inline-flex items-center rounded border border-border bg-card px-1.5 text-[10px] font-mono text-muted-foreground">
              ⌘K
            </kbd>
          </button>

          {/* Notification Bell */}
          <button
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            aria-label="Notifications"
            onClick={() => toast.info("Notifications System", { description: "No new unread system alerts." })}
          >
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary ring-2 ring-card" />
          </button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Profile Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen((prev) => !prev)}
              className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-card p-1.5 hover:border-primary/40 transition-all focus:outline-none"
              aria-expanded={isProfileOpen}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-primary to-brand-electric font-bold text-xs text-white shadow-sm">
                {initials}
              </div>
              <div className="hidden text-left sm:block pr-1">
                <p className="text-xs font-bold leading-tight text-foreground">{userName}</p>
                <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {userRole}
                </p>
              </div>
            </button>

            {/* Profile Dropdown Panel */}
            <AnimatePresence>
              {isProfileOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsProfileOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 z-50 w-64 rounded-2xl border border-border/60 bg-card/95 p-4 shadow-2xl backdrop-blur-xl space-y-3"
                  >
                    {/* User Header */}
                    <div className="flex items-center gap-3 border-b border-border/40 pb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-primary to-brand-electric font-bold text-sm text-white">
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-foreground">
                          {userName}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {userEmail}
                        </p>
                      </div>
                    </div>

                    {/* Active Tenant Note */}
                    <div className="rounded-xl border border-border/40 bg-muted/40 p-2.5">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Building2 className="h-3.5 w-3.5 text-primary" />
                        <span className="truncate font-medium">{tenantName}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-1 pt-1">
                      <Link
                        href="/settings"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        <UserIcon className="h-4 w-4" />
                        <span>Account Settings</span>
                      </Link>

                      <button
                        onClick={handleSignOut}
                        disabled={isLoggingOut}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Global Command Search Modal Placeholder */}
      <AnimatePresence>
        {isSearchOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border/80 bg-card p-4 shadow-2xl"
            >
              <div className="flex items-center gap-3 border-b border-border/50 pb-3">
                <Search className="h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Type a command or search modules..."
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground"
                >
                  ESC
                </button>
              </div>

              <div className="mt-3 space-y-1">
                <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Quick Navigation
                </p>
                {[
                  { name: "Go to Dashboard", href: "/dashboard" },
                  { name: "Go to Customers", href: "/customers" },
                  { name: "Go to Appointments", href: "/appointments" },
                  { name: "Go to Invoices", href: "/invoices" },
                  { name: "Go to Settings", href: "/settings" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsSearchOpen(false)}
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                  >
                    <span>{item.name}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
