"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Lock, AlertCircle, ArrowRight, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isResetDone, setIsResetDone] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const passwordVal = watch("password", "");

  const strengthChecks = {
    length: passwordVal.length >= 8,
    lowercase: /[a-z]/.test(passwordVal),
    uppercase: /[A-Z]/.test(passwordVal),
    number: /[0-9]/.test(passwordVal),
    special: /[^A-Za-z0-9]/.test(passwordVal),
  };

  const onSubmit = async (values: ResetPasswordSchema) => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      });

      if (error) {
        setErrorMsg(error.message);
        toast.error("Password reset failed", {
          description: error.message,
        });
      } else {
        setIsResetDone(true);
        toast.success("Password reset successfully!", {
          description: "You can now sign in with your new password.",
        });
      }
    } catch (err) {
      console.error("Reset password unexpected error:", err);
      const msg = "An unexpected error occurred. Please try again.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isResetDone) {
    return (
      <div className="space-y-6 text-center animate-fade-in">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-success/15 text-success border border-success/30">
          <Check className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Password Updated
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
            Your password has been reset successfully. Please click the button below to sign in using your new credentials.
          </p>
        </div>
        <div className="pt-4">
          <Button
            onClick={() => router.push("/login")}
            variant="primary"
            size="default"
            className="w-full flex justify-center h-11"
          >
            Go to login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-1.5 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground bg-gradient-to-r from-foreground via-foreground/90 to-foreground/75 bg-clip-text">
          Choose New Password
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter and confirm your new secure account password.
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
            htmlFor="password"
            className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block"
          >
            New Password
          </label>
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
            <p className="text-xs text-destructive mt-1.5">
              {errors.password.message}
            </p>
          )}

          {/* Password Strength Indicator */}
          {passwordVal && (
            <div className="mt-3.5 p-3.5 bg-muted rounded-xl space-y-2 border border-border/80 animate-fade-in transition-all">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                Password Security Checks
              </span>
              <ul className="text-xs space-y-2">
                {[
                  { key: "length", label: `Minimum 8 characters (${passwordVal.length}/8)` },
                  { key: "lowercase", label: "One lowercase letter" },
                  { key: "uppercase", label: "One uppercase letter" },
                  { key: "number", label: "One numeric character" },
                  { key: "special", label: "One special character" },
                ].map((check) => {
                  const passed = strengthChecks[check.key as keyof typeof strengthChecks];
                  return (
                    <li
                      key={check.key}
                      className="flex items-center gap-2.5 transition-colors duration-200"
                    >
                      <span
                        className={`h-2 w-2 rounded-full transition-all duration-200 ${
                          passed
                            ? "bg-success scale-110 shadow-sm shadow-success/30"
                            : "bg-muted-foreground/30"
                        }`}
                      />
                      <span
                        className={`transition-colors duration-200 font-medium ${
                          passed
                            ? "text-success-dark dark:text-success"
                            : "text-muted-foreground"
                        }`}
                      >
                        {check.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="confirmPassword"
            className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block"
          >
            Confirm New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              disabled={isSubmitting}
              hasError={!!errors.confirmPassword}
              className="pl-10"
              {...register("confirmPassword")}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-destructive mt-1.5">
              {errors.confirmPassword.message}
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
              <span>Updating password...</span>
            </div>
          ) : (
            <span className="flex items-center gap-1.5">
              <span>Reset Password</span>
              <ArrowRight width={14} height={14} />
            </span>
          )}
        </Button>
      </form>
    </div>
  );
}
