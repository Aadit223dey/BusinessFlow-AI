"use client";

import { useAuth } from "@/providers/auth-provider";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { Dialog } from "@/components/ui/dialog";
import { useDisclosure } from "@/hooks/use-disclosure";
import { toast } from "@/components/ui/toast";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function DashboardPage() {
  const { user, profile, role, isLoading } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const drawerControl = useDisclosure();
  const dialogControl = useDisclosure();

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error("Logout failed", {
          description: error.message,
        });
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <svg
            className="animate-spin h-8 w-8 text-primary"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-sm font-medium text-muted-foreground animate-pulse">
            Loading secure workspace...
          </span>
        </div>
      </div>
    );
  }

  const userDisplayName =
    profile?.first_name || profile?.last_name
      ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim()
      : user?.email;

  return (
    <div className="min-h-screen bg-background flex flex-col" data-theme-transition>
      {/* Header Navigation */}
      <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <svg
              width="18"
              height="18"
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
          <span className="font-bold tracking-tight text-foreground text-sm">
            BusinessFlow AI
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-foreground">
              {userDisplayName}
            </p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Role: {role ?? "STAFF"}
            </p>
          </div>
          <ThemeToggle />
          <Button
            onClick={handleSignOut}
            variant="outline"
            size="sm"
            disabled={isLoggingOut}
          >
            {isLoggingOut ? "Signing out..." : "Log Out"}
          </Button>
        </div>
      </header>

      {/* Main Secure Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-8 space-y-8 animate-fade-in">
        {/* Verification banner */}
        <div className="p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-foreground">
              Workspace Secured Successfully
            </h2>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Sprint 2 Authorization layer is active. This session context is fully isolated,
              cross-tenant navigation paths are restricted by middleware rules, and the PL/pgSQL
              identity provisioning function is operational.
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={drawerControl.onOpen} variant="outline" size="sm">
              Verify Drawer UI
            </Button>
            <Button onClick={dialogControl.onOpen} variant="primary" size="sm">
              Verify Dialog UI
            </Button>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-card border border-border rounded-xl space-y-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 00-3-3.87" />
                <path d="M16 3.13a4 4 0 010 7.75" />
              </svg>
            </div>
            <h3 className="font-semibold text-sm text-foreground">Identity Session</h3>
            <p className="text-xs text-muted-foreground leading-normal">
              Active profile mapped safely from <code className="text-primary bg-primary/5 px-1 py-0.5 rounded">auth.users</code> using ID: <span className="font-mono text-[10px] break-all block mt-1">{user?.id}</span>
            </p>
          </div>

          <div className="p-6 bg-card border border-border rounded-xl space-y-3">
            <div className="h-10 w-10 rounded-lg bg-success/10 text-success flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </div>
            <h3 className="font-semibold text-sm text-foreground">RBAC Policy Guard</h3>
            <p className="text-xs text-muted-foreground leading-normal">
              Row-Level Security (RLS) restricts database queries matching tenant ID. Your current role is <strong className="text-success">{role ?? "STAFF"}</strong>.
            </p>
          </div>

          <div className="p-6 bg-card border border-border rounded-xl space-y-3">
            <div className="h-10 w-10 rounded-lg bg-warning/10 text-warning flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <h3 className="font-semibold text-sm text-foreground">Realtime Channel</h3>
            <p className="text-xs text-muted-foreground leading-normal">
              Connection channel is connected with throughput capped at <strong>20 events/sec</strong> to protect database performance.
            </p>
          </div>
        </div>
      </main>

      {/* Regression Check UI Components */}
      <Drawer
        isOpen={drawerControl.isOpen}
        onClose={drawerControl.onClose}
        title="Sprint 1 Regression Check"
        description="Verify slide-in drawer layout renders correctly with clean overlay backdrop transition."
      >
        <div className="space-y-4 pt-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            This Drawer uses the global <code className="bg-muted px-1 py-0.5 rounded">useDisclosure()</code> hook and remains functional without breaking layout states.
          </p>
          <Button onClick={drawerControl.onClose} variant="outline" size="sm" className="w-full">
            Dismiss
          </Button>
        </div>
      </Drawer>

      <Dialog
        isOpen={dialogControl.isOpen}
        onClose={dialogControl.onClose}
        title="Confirm Verification"
        description="This modal triggers to check dialog constraints and sequential focus trapping."
      >
        <div className="space-y-4 pt-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            When this modal is active, focus is trapped sequentially within the modal buttons. Pressing Escape closes it.
          </p>
          <div className="flex justify-end gap-3">
            <Button onClick={dialogControl.onClose} variant="outline" size="sm">
              Cancel
            </Button>
            <Button
              onClick={() => {
                toast.success("Action Verified!");
                dialogControl.onClose();
              }}
              variant="primary"
              size="sm"
            >
              Verify
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
