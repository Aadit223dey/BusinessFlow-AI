"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  UserCheck,
  AlertTriangle,
  LogOut,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/toast";

export default function StaffPortalPage() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Signout error:", err);
      toast.error("Error signing out");
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <header className="flex h-16 items-center justify-between px-6 sm:px-8 border-b border-border/60 bg-card/70 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500 border border-violet-500/20 font-bold text-sm">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-foreground">BusinessFlow AI</span>
              <span className="rounded-full bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 text-[10px] font-extrabold uppercase text-violet-500">
                Staff Workspace
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="gap-2 text-xs text-destructive hover:bg-destructive/10 border-destructive/20"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>{isSigningOut ? "Signing out..." : "Sign Out"}</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 sm:p-8">
        <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-violet-500/20 bg-card/70 p-8 sm:p-10 shadow-premium backdrop-blur-xl text-center space-y-6">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />

          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold text-violet-500">
            <Clock className="h-4 w-4" />
            <span>Staff Account Portal</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              Staff Workspace Portal 📋
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Your daily schedule, assigned appointments, performance metrics, and shift rosters will appear here once linked to your employer's business.
            </p>
          </div>

          {/* Notice Block */}
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-left space-y-2 text-xs text-amber-600 dark:text-amber-400">
            <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-300">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Invitation Link Required</span>
            </div>
            <p className="text-amber-700/90 dark:text-amber-400/90 leading-relaxed">
              Staff accounts require an official invitation link sent by a business administrator. Self-registration is disabled for staff members. Please request an invitation link from your employer.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-2">
            <Button
              variant="outline"
              size="default"
              className="w-full sm:w-auto text-muted-foreground gap-2"
              onClick={handleSignOut}
              disabled={isSigningOut}
            >
              <LogOut className="h-4 w-4" />
              <span>{isSigningOut ? "Signing out..." : "Sign Out"}</span>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
