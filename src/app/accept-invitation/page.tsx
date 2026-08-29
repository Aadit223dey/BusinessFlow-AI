"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

export default function AcceptInvitationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [inviteData, setInviteData] = useState<{ email: string; tenantName: string } | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function initSessionAndVerify() {
      try {
        // 1. Check for error in hash fragment FIRST
        //    Supabase redirects with #error=access_denied&error_code=otp_expired when
        //    the invitation magic link has expired or was already consumed.
        const hash = window.location.hash;
        if (hash) {
          const params = new URLSearchParams(hash.substring(1));
          const hashError = params.get("error");
          const hashErrorCode = params.get("error_code");
          const hashErrorDesc = params.get("error_description");

          if (hashError || hashErrorCode) {
            if (isMounted) {
              setErrorCode(hashErrorCode || hashError);

              if (hashErrorCode === "otp_expired") {
                setError(
                  "Your invitation link has expired. Please ask the Business Owner to resend the invitation from the Staff Management page."
                );
              } else if (hashErrorCode === "otp_disabled") {
                setError(
                  "Magic links are disabled for this project. Please contact your administrator."
                );
              } else {
                setError(
                  hashErrorDesc?.replace(/\+/g, " ") ||
                    "The invitation link is invalid. Please request a new invitation."
                );
              }
              setLoading(false);
            }
            return;
          }
        }

        // 2. Let Supabase client extract access_token / refresh_token from hash fragment
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("❌ [ACCEPT-INVITE] Session error:", sessionError);
        }

        // 3. Set up auth state change listener to catch token exchange
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (event, currentSession) => {
            if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && currentSession) {
              await verifyInvitation();
            }
          }
        );

        if (session) {
          await verifyInvitation();
        } else {
          // Give client 2s to parse hash fragment and exchange tokens
          setTimeout(() => {
            if (isMounted && !inviteData && loading) {
              verifyInvitation();
            }
          }, 2000);
        }

        return () => {
          authListener.subscription.unsubscribe();
        };
      } catch (err) {
        console.error("❌ [ACCEPT-INVITE] Init error:", err);
        if (isMounted) {
          setError("Failed to initialize invitation session.");
          setLoading(false);
        }
      }
    }

    async function verifyInvitation() {
      try {
        const res = await fetch("/api/invitations/verify-session");
        const data = await res.json();

        if (!isMounted) return;

        if (data.alreadyAccepted && data.redirectUrl) {
          window.location.href = data.redirectUrl;
          return;
        }

        if (!res.ok) {
          // If we have no session but also no hash error, the link may have been
          // opened without the hash fragment (e.g., copied URL without #...)
          if (data.error === "NO_SESSION") {
            setError(
              "No authenticated session detected. This can happen if the invitation link was copied without the full URL, or if it has already been used. Please click the link directly from your invitation email, or ask the Business Owner to resend the invitation."
            );
          } else {
            setError(data.message || "Invalid or expired invitation link.");
          }
          setLoading(false);
          return;
        }

        setInviteData(data);
        setLoading(false);
      } catch (err) {
        if (isMounted) {
          setError("Network error validating your invitation.");
          setLoading(false);
        }
      }
    }

    initSessionAndVerify();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/invitations/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, password }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to finalize staff account");
      }

      // Hard navigation to trigger server context refresh
      window.location.href = result.redirectUrl || "/staff-portal";
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            Verifying your staff invitation...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    const isExpired = errorCode === "otp_expired";

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center space-y-6 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center mx-auto text-red-600">
            {isExpired ? (
              <RefreshCw className="w-6 h-6" />
            ) : (
              <AlertTriangle className="w-6 h-6" />
            )}
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {isExpired ? "Invitation Link Expired" : "Unable to Accept Invitation"}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{error}</p>
          </div>
          {isExpired && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-left">
              <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                💡 How to fix this:
              </p>
              <ol className="text-xs text-amber-700 dark:text-amber-400 mt-1 space-y-1 list-decimal list-inside">
                <li>Ask your Business Owner to open the Staff Management page</li>
                <li>They should delete the expired invitation</li>
                <li>Then resend a new invitation to your email</li>
                <li>Click the new link within 24 hours</li>
              </ol>
            </div>
          )}
          <Button
            onClick={() => router.push("/login")}
            className="w-full"
            variant="outline"
          >
            Return to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 space-y-6 shadow-xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-950/50 flex items-center justify-center mx-auto text-indigo-600 mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Join {inviteData?.tenantName}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Set up your staff account for{" "}
            <strong className="text-slate-800 dark:text-slate-200">
              {inviteData?.email}
            </strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                First Name
              </label>
              <Input
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Jane"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Last Name
              </label>
              <Input
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Set Password
            </label>
            <Input
              required
              type="password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <span className="text-[11px] text-slate-500">Minimum 8 characters</span>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <CheckCircle2 className="w-4 h-4 mr-2" />
            )}
            Complete Setup & Launch Staff Portal
          </Button>
        </form>
      </div>
    </div>
  );
}
