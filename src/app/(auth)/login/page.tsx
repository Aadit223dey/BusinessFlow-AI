"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, AlertCircle, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";

import { getErrorMessage, logAuthTrace, logAuthError } from "@/lib/error-utils";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

type LoginSchema = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginSchema) => {
    setIsSubmitting(true);
    setAuthError(null);
    logAuthTrace("User Login Initiated", { email: values.email });

    try {
      const { data: signInData, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        logAuthError("Login Failed", error);
        const cleanMsg = getErrorMessage(error);
        setAuthError(cleanMsg);
        toast.error("Authentication failed", { description: cleanMsg });
        setIsSubmitting(false);
        return;
      }

      logAuthTrace("Login Success, settling cookies...", { userId: signInData.user?.id });
      await new Promise((resolve) => setTimeout(resolve, 100));

      const user = signInData.user;
      if (!user) {
        throw new Error("No user returned from authentication.");
      }

      // Retrieve user profile to evaluate multi-role portal routing
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, has_selected_role, has_completed_onboarding")
        .eq("id", user.id)
        .single();

      if (profileError) {
        logAuthError("Profile Lookup Error after login", profileError);
        // Fallback to root router
        router.replace("/");
      } else {
        logAuthTrace("Profile Retrieved on Login", profile);

        if (profile?.role === "SUPER_ADMIN" || user.email?.toLowerCase() === "dey223aadit@gmail.com") {
          router.replace("/admin-portal");
        } else if (!profile?.has_selected_role) {
          router.replace("/select-role");
        } else if (profile.role === "BUSINESS_OWNER") {
          if (profile.has_completed_onboarding) {
            router.replace("/dashboard");
          } else {
            router.replace("/onboarding");
          }
        } else if (profile.role === "CUSTOMER") {
          router.replace("/customer-portal");
        } else if (profile.role === "STAFF") {
          router.replace("/staff-portal");
        } else {
          router.replace("/select-role");
        }
      }

      router.refresh();
    } catch (err) {
      logAuthError("Login Unexpected Error", err);
      const cleanMsg = getErrorMessage(err);
      setAuthError(cleanMsg);
      toast.error("Login Error", { description: cleanMsg });
      setIsSubmitting(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-1.5 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground bg-gradient-to-r from-foreground via-foreground/90 to-foreground/75 bg-clip-text">
          Welcome Back
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and password to access your workspace.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {authError && (
          <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 text-destructive rounded-xl flex items-start gap-2.5 animate-fade-in">
            <AlertCircle width={16} height={16} className="shrink-0 mt-0.5" />
            <span className="leading-normal">{authError}</span>
          </div>
        )}

        {/* Email Address */}
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block"
          >
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              disabled={isSubmitting}
              hasError={!!errors.email}
              className="pl-10"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-destructive flex items-center gap-1 mt-1.5">
              <AlertCircle width={12} height={12} />
              <span>{errors.email.message}</span>
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label
              htmlFor="password"
              className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block"
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-primary hover:text-primary-dark transition-colors font-medium hover:underline underline-offset-2"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              disabled={isSubmitting}
              hasError={!!errors.password}
              className="pl-10"
              {...register("password")}
            />
          </div>
          {errors.password && (
            <p className="text-xs text-destructive flex items-center gap-1 mt-1.5">
              <AlertCircle width={12} height={12} />
              <span>{errors.password.message}</span>
            </p>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          size="default"
          className="w-full flex justify-center mt-6 h-11"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
              <span>Signing In...</span>
            </div>
          ) : (
            <span className="flex items-center gap-1.5">
              <span>Sign In</span>
              <ArrowRight width={14} height={14} />
            </span>
          )}
        </Button>
      </form>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground mt-4">
        New to BusinessFlow?{" "}
        <Link
          href="/register"
          className="font-medium text-primary hover:text-primary-dark underline underline-offset-4 transition-colors"
        >
          Create an account
        </Link>
      </div>
    </div>
  );
}
