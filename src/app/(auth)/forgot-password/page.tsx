"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Mail, AlertCircle, ArrowRight, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: ForgotPasswordSchema) => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setErrorMsg(error.message);
        toast.error("Request failed", {
          description: error.message,
        });
      } else {
        setIsSent(true);
        toast.success("Recovery link sent!", {
          description: "Check your email inbox for the reset link.",
        });
      }
    } catch (err) {
      console.error("Forgot password unexpected error:", err);
      const msg = "An unexpected error occurred. Please try again.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSent) {
    return (
      <div className="space-y-6 text-center animate-fade-in">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary/15 text-primary border border-primary/30">
          <Check className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Check your email
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
            We have sent a secure password recovery link to your email address. Please click the link to configure a new password.
          </p>
        </div>
        <div className="pt-4">
          <Link
            href="/login"
            className="text-sm text-primary hover:text-primary-dark font-medium underline underline-offset-4"
          >
            Return to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-1.5 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground bg-gradient-to-r from-foreground via-foreground/90 to-foreground/75 bg-clip-text">
          Recover Password
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we will send you a link to reset your password.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {errorMsg && (
          <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 text-destructive rounded-xl flex items-start gap-2.5 animate-fade-in">
            <AlertCircle width={16} height={16} className="shrink-0 mt-0.5" />
            <span className="leading-normal">{errorMsg}</span>
          </div>
        )}

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
              <span>Sending recovery link...</span>
            </div>
          ) : (
            <span className="flex items-center gap-1.5">
              <span>Send Recovery Link</span>
              <ArrowRight width={14} height={14} />
            </span>
          )}
        </Button>
      </form>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground mt-4">
        Remember your password?{" "}
        <Link
          href="/login"
          className="font-medium text-primary hover:text-primary-dark underline underline-offset-4 transition-colors"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
