"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, UserCircle2, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { motion } from "framer-motion";

import { getErrorMessage, logAuthTrace, logAuthError } from "@/lib/error-utils";

export function RoleSelectionCards() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<"BUSINESS_OWNER" | "CUSTOMER">("BUSINESS_OWNER");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRoleSubmit = async () => {
    setIsSubmitting(true);
    logAuthTrace("Submitting selected role choice", { selectedRole });
    try {
      const response = await fetch("/api/auth/set-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole }),
      });

      const data = await response.json();

      if (!response.ok) {
        logAuthError("Role Selection API Error", data.error);
        const cleanMsg = getErrorMessage(data.error);
        toast.error("Role Selection Failed", {
          description: cleanMsg,
        });
        setIsSubmitting(false);
        return;
      }

      logAuthTrace("Role Selection Saved Successfully", data);
      toast.success("Role Saved!", {
        description:
          selectedRole === "BUSINESS_OWNER"
            ? "Directing to business onboarding wizard..."
            : "Directing to customer portal...",
      });

      router.replace(data.redirectPath);
      router.refresh();
    } catch (err) {
      logAuthError("Role Selection Unexpected Exception", err);
      const cleanMsg = getErrorMessage(err);
      toast.error("Role Error", { description: cleanMsg });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Header text */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Account Setup Step 1</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Welcome to BusinessFlow AI 👋
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
          Select your account type to personalize your workspace experience.
        </p>
      </div>

      {/* Dual Cards Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Business Owner */}
        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ duration: 0.2 }}
          onClick={() => setSelectedRole("BUSINESS_OWNER")}
          className={`
            relative cursor-pointer overflow-hidden rounded-2xl border p-6 sm:p-8 backdrop-blur-md transition-all duration-300 flex flex-col justify-between
            ${
              selectedRole === "BUSINESS_OWNER"
                ? "border-primary bg-card/90 ring-2 ring-primary/40 shadow-xl"
                : "border-border/60 bg-card/50 hover:border-primary/40 hover:bg-card/70 shadow-sm"
            }
          `}
        >
          <div className="space-y-4">
            {/* Top Row: Icon + Radio Indicator */}
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20">
                <Building2 className="h-6 w-6" />
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-primary">
                  Full Business Suite
                </span>
                <div
                  className={`h-6 w-6 rounded-full border flex items-center justify-center transition-colors ${
                    selectedRole === "BUSINESS_OWNER"
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border/80 bg-muted"
                  }`}
                >
                  {selectedRole === "BUSINESS_OWNER" && (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                </div>
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">Business Owner</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                I own, manage, or operate a business and want to streamline daily operations, scheduling, staff, inventory, and billing.
              </p>
            </div>

            {/* Features summary */}
            <ul className="space-y-1.5 text-xs text-foreground/80 pt-2">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                8-Step Workspace Onboarding Setup
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Complete Operational Cockpit Dashboard
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Card 2: Customer / Client */}
        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ duration: 0.2 }}
          onClick={() => setSelectedRole("CUSTOMER")}
          className={`
            relative cursor-pointer overflow-hidden rounded-2xl border p-6 sm:p-8 backdrop-blur-md transition-all duration-300 flex flex-col justify-between
            ${
              selectedRole === "CUSTOMER"
                ? "border-primary bg-card/90 ring-2 ring-primary/40 shadow-xl"
                : "border-border/60 bg-card/50 hover:border-primary/40 hover:bg-card/70 shadow-sm"
            }
          `}
        >
          <div className="space-y-4">
            {/* Top Row: Icon + Radio Indicator */}
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-electric/10 text-brand-electric border border-brand-electric/20">
                <UserCircle2 className="h-6 w-6" />
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-brand-electric/10 border border-brand-electric/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-brand-electric">
                  Self-Service Portal
                </span>
                <div
                  className={`h-6 w-6 rounded-full border flex items-center justify-center transition-colors ${
                    selectedRole === "CUSTOMER"
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border/80 bg-muted"
                  }`}
                >
                  {selectedRole === "CUSTOMER" && (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                </div>
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">Customer / Client</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                I want to discover local businesses, book appointments, manage my bookings, and view digital invoices.
              </p>
            </div>

            {/* Features summary */}
            <ul className="space-y-1.5 text-xs text-foreground/80 pt-2">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-electric" />
                Instant Self-Service Portal Access
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-electric" />
                Online Booking & Invoice History
              </li>
            </ul>
          </div>
        </motion.div>
      </div>

      {/* Action Button */}
      <div className="flex justify-center pt-2">
        <Button
          onClick={handleRoleSubmit}
          disabled={isSubmitting}
          variant="primary"
          size="lg"
          className="w-full sm:w-auto px-8 gap-2 font-bold shadow-md hover:shadow-xl"
        >
          <span>{isSubmitting ? "Saving Choice..." : "Continue with Selected Role"}</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
