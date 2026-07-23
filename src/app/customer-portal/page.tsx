"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  UserCircle2,
  CalendarCheck,
  FileText,
  CreditCard,
  Star,
  LogOut,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/toast";

export default function CustomerPortalPage() {
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
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-electric/10 text-brand-electric border border-brand-electric/20 font-bold text-sm">
            <UserCircle2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-foreground">BusinessFlow AI</span>
              <span className="rounded-full bg-brand-electric/10 border border-brand-electric/20 px-2 py-0.5 text-[10px] font-extrabold uppercase text-brand-electric">
                Customer Portal
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
        <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-brand-electric/20 bg-card/70 p-8 sm:p-12 shadow-premium backdrop-blur-xl text-center space-y-6">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-electric/10 blur-3xl" />

          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-electric/20 bg-brand-electric/10 px-4 py-1.5 text-xs font-semibold text-brand-electric">
            <Sparkles className="h-4 w-4" />
            <span>Self-Service Portal Initialized</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Welcome to Your Customer Portal 🎉
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
              Online booking, appointment history, digital invoices, payment methods, and reviews are being prepared for your account.
            </p>
          </div>

          {/* Upcoming customer features */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-left">
            {[
              { label: "Book Appointments", icon: CalendarCheck },
              { label: "Digital Invoices", icon: FileText },
              { label: "Saved Payments", icon: CreditCard },
              { label: "Reviews & Ratings", icon: Star },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="rounded-xl border border-border/50 bg-muted/30 p-3 text-center space-y-1.5"
                >
                  <Icon className="h-4 w-4 text-brand-electric mx-auto" />
                  <p className="text-[11px] font-bold text-foreground">{f.label}</p>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Button
              variant="primary"
              size="default"
              className="w-full sm:w-auto gap-2 font-bold"
              onClick={() => toast.info("Demo Mode", { description: "Service discovery catalog coming in Sprint 5!" })}
            >
              <span>Browse Sample Services (Demo)</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="default"
              className="w-full sm:w-auto text-muted-foreground"
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
