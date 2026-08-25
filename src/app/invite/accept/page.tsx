"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, CheckCircle2, AlertTriangle, ShieldCheck, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/toast";

interface InviteVerification {
  email: string;
  tenantName: string;
  invitedRole: string;
}

export default function AcceptInvitationPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteData, setInviteData] = useState<InviteVerification | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function verifyInvitation() {
      try {
        // Step 1: Ensure Supabase client has detected any session from
        // the auth callback cookies or hash fragments
        await supabase.auth.getSession();

        // Step 2: Call the server verification endpoint
        // The server reads the authenticated session cookies set by /auth/callback
        const res = await fetch("/api/invitations/verify-session");
        const data = await res.json();

        if (!isMounted) return;

        if (!res.ok) {
          setError(data.message || "Invalid or expired invitation link.");
          setLoading(false);
          return;
        }

        setInviteData(data);
        setLoading(false);
      } catch {
        if (isMounted) {
          setError("Network error while validating your invitation.");
          setLoading(false);
        }
      }
    }

    verifyInvitation();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setFormError("Password must be at least 8 characters long.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/invitations/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, password }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to finalize account");
      }

      toast.success("Account Setup Complete! 🎉", {
        description: "Welcome to your staff workspace.",
      });

      // Hard redirect to refresh server-side session context
      window.location.href = result.redirectUrl || "/staff-portal";
    } catch (err: any) {
      setFormError(err.message);
      toast.error("Setup Failed", { description: err.message });
      setSubmitting(false);
    }
  };

  // ── Loading State ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <p className="text-sm font-medium text-muted-foreground">
            Verifying your staff invitation...
          </p>
        </div>
      </div>
    );
  }

  // ── Error State ──────────────────────────────────────────────────
  if (error || !inviteData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full bg-card rounded-2xl p-8 border border-border text-center space-y-6 shadow-xl animate-fade-in">
          <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-2xl bg-destructive/10 text-destructive border border-destructive/20">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Unable to Accept Invitation
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {error || "This invitation link is invalid, expired, or has already been accepted."}
            </p>
          </div>
          <Button asChild className="w-full">
            <Link href="/login">Return to Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  // ── Acceptance Form ──────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full bg-card rounded-2xl p-8 border border-border space-y-6 shadow-xl animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 text-primary border border-primary/20 mb-2">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Join {inviteData.tenantName}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Set up your staff credentials to complete onboarding on{" "}
            <strong>BusinessFlow AI</strong>.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 text-xs rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">
              {formError}
            </div>
          )}

          {/* Email (Read Only) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Invited Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                value={inviteData.email}
                readOnly
                disabled
                className="pl-10 bg-muted/50 cursor-not-allowed opacity-90"
              />
            </div>
          </div>

          {/* First & Last Name */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                First Name <span className="text-destructive">*</span>
              </label>
              <Input
                type="text"
                placeholder="Jane"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                disabled={submitting}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Last Name <span className="text-destructive">*</span>
              </label>
              <Input
                type="text"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                disabled={submitting}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Create Password <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                disabled={submitting}
                className="pl-10"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Confirm Password <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                disabled={submitting}
                className="pl-10"
              />
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 h-11 text-sm font-bold"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up Account...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Complete Setup & Launch Portal
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
