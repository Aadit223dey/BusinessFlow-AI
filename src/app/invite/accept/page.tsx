"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, AlertCircle, ArrowRight, Loader2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { parseAuthError } from "@/lib/auth-errors";

interface InvitationValidationData {
  valid: boolean;
  invitation?: {
    id: string;
    email: string;
    role: string;
    businessName: string;
    inviterName: string;
    expiresAt: string;
  };
}

function AcceptInvitationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [isValidating, setIsValidating] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [inviteData, setInviteData] = useState<InvitationValidationData["invitation"] | null>(null);

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setValidationError("No invitation token provided. Please check your invitation email.");
      setIsValidating(false);
      return;
    }

    const validateToken = async () => {
      try {
        const response = await fetch(`/api/invitations/validate?token=${encodeURIComponent(token)}`);
        const data = await response.json();

        if (!response.ok || !data.valid) {
          setValidationError(data.error || "This invitation link is invalid, expired, or has already been used.");
        } else {
          setInviteData(data.invitation);
        }
      } catch (err) {
        setValidationError("Unable to validate invitation. Please check your internet connection.");
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

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
      const response = await fetch("/api/invitations/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password,
          firstName,
          lastName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const parsed = parseAuthError(data.error);
        setFormError(parsed.message);
        toast.error(parsed.title, { description: parsed.message });
        return;
      }

      toast.success("Account Created & Linked! 🎉", {
        description: "Welcome to your staff portal workspace.",
      });

      // Redirect directly to /staff-portal
      router.replace(data.redirectPath || "/staff-portal");
      router.refresh();
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
          <p className="text-sm font-medium text-muted-foreground">Validating your invitation link...</p>
        </div>
      </div>
    );
  }

  // Error State: Invalid / Expired Token
  if (validationError || !inviteData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="w-full max-w-md border border-border bg-card rounded-2xl shadow-xl p-8 text-center space-y-6 animate-fade-in">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-destructive/10 text-destructive border border-destructive/20">
            <AlertCircle className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Invalid or Expired Invitation
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {validationError || "This invitation link is invalid, expired, or has already been used."}
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

  // Valid Token State
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-md border border-border bg-card rounded-2xl shadow-xl p-8 space-y-6 animate-fade-in">
        {/* Banner */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <Shield className="h-3.5 w-3.5" />
            <span>Staff Team Invitation</span>
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Join {inviteData.businessName} 🏢
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {inviteData.inviterName} has invited you to join their staff workspace on <strong>BusinessFlow AI</strong>.
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
          <Button type="submit" disabled={isSubmitting} className="w-full mt-2 h-11 text-sm font-bold">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up Account...
              </>
            ) : (
              <>
                Accept Invitation & Launch Workspace
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
