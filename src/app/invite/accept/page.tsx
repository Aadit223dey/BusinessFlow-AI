"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, AlertCircle, ArrowRight, Loader2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { supabase } from "@/lib/supabase";
import { parseAuthError } from "@/lib/auth-errors";

interface InvitationData {
  email: string;
  tenantName: string;
  invitedRole: string;
  inviterName?: string;
}

function AcceptInvitationContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isValidating, setIsValidating] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [inviteData, setInviteData] = useState<InvitationData | null>(null);

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function checkAuthAndVerify() {
      try {
        // ── 1. Check for Direct Token Link (?token=...) ───────────────
        if (token) {
          const res = await fetch(`/api/invitations/validate?token=${encodeURIComponent(token)}`);
          const data = await res.json();
          if (res.ok && data.valid && isMounted) {
            setInviteData({
              email: data.email,
              tenantName: data.tenantName,
              invitedRole: data.invitedRole || "STAFF",
              inviterName: data.inviterName,
            });
            setIsValidating(false);
            return;
          }
        }

        // ── 2. Check for Native Supabase Auth Invited Session ─────────
        // (From email magic link with #access_token=... or session cookies)
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user?.email) {
          const res = await fetch("/api/invitations/verify-session");
          const data = await res.json();

          if (res.ok && data.valid && isMounted) {
            setInviteData({
              email: data.email,
              tenantName: data.tenantName,
              invitedRole: data.invitedRole || "STAFF",
            });
            setIsValidating(false);
            return;
          } else if (isMounted) {
            setValidationError(
              data.error || "No active pending invitation found for your authenticated account."
            );
            setIsValidating(false);
            return;
          }
        }

        // ── 3. Listen for async auth state change from URL hash ────────
        const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
          if (!isMounted) return;

          if (session?.user?.email) {
            const res = await fetch("/api/invitations/verify-session");
            const data = await res.json();

            if (res.ok && data.valid && isMounted) {
              setInviteData({
                email: data.email,
                tenantName: data.tenantName,
                invitedRole: data.invitedRole || "STAFF",
              });
              setValidationError(null);
              setIsValidating(false);
            } else if (isMounted) {
              setValidationError(
                data.error || "No active pending invitation found for your authenticated account."
              );
              setIsValidating(false);
            }
          }
        });

        // Set safety timeout if no session and no token arrived
        setTimeout(() => {
          if (isMounted && isValidating) {
            supabase.auth.getSession().then(({ data: { session } }) => {
              if (!session && !token && isMounted) {
                setValidationError(
                  "No invitation token or authenticated session found. Please click the link from your invitation email."
                );
                setIsValidating(false);
              }
            });
          }
        }, 3000);

        return () => {
          authListener.subscription.unsubscribe();
        };
      } catch (err: any) {
        if (isMounted) {
          setValidationError(err.message || "Failed to validate invitation.");
          setIsValidating(false);
        }
      }
    }

    checkAuthAndVerify();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setFormError("Password must be at least 8 characters long.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const response = await fetch("/api/invitations/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          firstName,
          lastName,
          token: token || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const parsed = parseAuthError(data.error);
        setFormError(parsed.message);
        toast.error(parsed.title, { description: parsed.message });
        return;
      }

      toast.success("Account Setup Complete! 🎉", {
        description: "Welcome to your staff workspace.",
      });

      // Hard redirect to staff portal to hydrate fresh profile and cookies
      window.location.href = data.redirectUrl || "/staff-portal";
    } catch (err) {
      const parsed = parseAuthError(err);
      setFormError(parsed.message);
      toast.error(parsed.title, { description: parsed.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading State
  if (isValidating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-sm font-medium text-muted-foreground">
            Verifying your staff invitation...
          </p>
        </div>
      </div>
    );
  }

  // Error State: Invalid / Expired
  if (validationError || !inviteData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="w-full max-w-md border border-border bg-card rounded-3xl shadow-2xl p-8 text-center space-y-6 animate-fade-in">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-destructive/10 text-destructive border border-destructive/20">
            <AlertCircle className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Invalid or Expired Invitation
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {validationError ||
                "This invitation link is invalid, expired, or has already been accepted. Please contact your business administrator."}
            </p>
          </div>

          <div className="pt-2">
            <Button asChild className="w-full">
              <Link href="/login">Return to Login</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Valid Invitation Setup Form
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-md border border-border bg-card rounded-3xl shadow-2xl p-8 space-y-6 animate-fade-in">
        {/* Banner */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3.5 py-1 text-xs font-semibold text-violet-500">
            <Shield className="h-3.5 w-3.5" />
            <span>Staff Team Workspace</span>
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Join {inviteData.tenantName} 🏢
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Set up your credentials to complete onboarding and launch your team workspace on{" "}
            <strong>BusinessFlow AI</strong>.
          </p>
        </div>

        {/* Acceptance Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 text-xs rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">
              {formError}
            </div>
          )}

          {/* Email (Pre-filled Read Only) */}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
                className="pl-10"
              />
            </div>
          </div>

          {/* Action Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 h-11 text-sm font-bold shadow-lg shadow-primary/20"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up Account...
              </>
            ) : (
              <>
                Complete Setup & Launch Staff Portal
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background px-6">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
        </div>
      }
    >
      <AcceptInvitationContent />
    </Suspense>
  );
}
