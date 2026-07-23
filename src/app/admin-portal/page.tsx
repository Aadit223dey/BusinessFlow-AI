"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Building2,
  Users,
  CreditCard,
  Activity,
  Sliders,
  Lock,
  LogOut,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/toast";

const adminModules = [
  {
    title: "Tenant & Business Governance",
    description: "View, audit, approve, and manage active multi-tenant workspaces.",
    icon: Building2,
    badge: "Multi-Tenant",
  },
  {
    title: "Platform User Directory",
    description: "Global user management, access credentials, and security oversight.",
    icon: Users,
    badge: "Identity",
  },
  {
    title: "Subscription & Billing Engine",
    description: "Global platform revenue, subscription distribution, and enterprise billing.",
    icon: CreditCard,
    badge: "Finance",
  },
  {
    title: "System-Wide Telemetry",
    description: "Monitor active usage, appointment throughput, and database performance.",
    icon: Activity,
    badge: "Telemetry",
  },
  {
    title: "Feature Flag Control Console",
    description: "Toggle experimental features, industry profiles, and global modules.",
    icon: Sliders,
    badge: "Governance",
  },
  {
    title: "Audit Logs & Security",
    description: "Real-time security events, access logs, and automated compliance tracking.",
    icon: Lock,
    badge: "Security",
  },
];

export default function AdminPortalPage() {
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
      {/* Top Header */}
      <header className="flex h-16 items-center justify-between px-6 sm:px-8 border-b border-border/60 bg-card/70 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-sm font-bold text-sm">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-foreground">BusinessFlow AI</span>
              <span className="rounded-full bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 text-[10px] font-extrabold uppercase text-purple-500">
                Super Admin
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

      {/* Main Canvas */}
      <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-8">
        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-r from-purple-600/15 via-indigo-600/10 to-transparent p-6 sm:p-8 shadow-sm backdrop-blur-md">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-purple-600/10 blur-3xl" />

          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-card/60 px-3 py-1 text-xs font-semibold text-purple-500">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Global Platform Administration</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              BusinessFlow AI Platform Command Center 🛡️
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
              Global platform administration, tenant governance, system-wide monitoring, and enterprise security controls active.
            </p>
          </div>
        </div>

        {/* 6 Preview Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminModules.map((mod, idx) => {
            const Icon = mod.icon;
            return (
              <div
                key={idx}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-6 shadow-sm backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:border-purple-500/40 hover:shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-muted border border-border/50 px-2.5 py-0.5 text-[10px] font-bold text-muted-foreground uppercase">
                      {mod.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-foreground group-hover:text-purple-500 transition-colors">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {mod.description}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-semibold text-purple-500">Super Admin Domain</span>
                  <span className="text-[10px] font-mono">ACTIVE</span>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
