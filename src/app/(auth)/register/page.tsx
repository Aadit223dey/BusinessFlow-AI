"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { User, Mail, Lock, AlertCircle, ArrowRight, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";

import { getErrorMessage, logAuthTrace, logAuthError } from "@/lib/error-utils";

const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
});

type RegisterSchema = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
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

  const onSubmit = async (values: RegisterSchema) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    logAuthTrace("User Signup Initiated", { email: values.email });

    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            first_name: values.firstName,
            last_name: values.lastName,
          },
        },
      });

      if (error) {
        logAuthError("User Signup Failed", error);
        const cleanMessage = getErrorMessage(error);
        setErrorMsg(cleanMessage);
        toast.error("Registration failed", {
          description: cleanMessage,
        });
      } else {
        logAuthTrace("User Signup Success", { userId: data.user?.id, email: data.user?.email });
        setIsRegistered(true);
        toast.success("Registration successful!", {
          description: "Check your email for the verification link.",
        });
      }
    } catch (err) {
      logAuthError("SignUp Unexpected Exception", err);
      const cleanMessage = getErrorMessage(err);
      setErrorMsg(cleanMessage);
      toast.error("Registration Error", { description: cleanMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isRegistered) {
    return (
      <div className="space-y-6 text-center animate-fade-in">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-success/15 text-success border border-success/30">
          <Check className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Verify Your Email
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
            We have sent a verification link to your email address. Please click the link to confirm your account and complete registration.
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
          Create an Account
        </h1>
        <p className="text-sm text-muted-foreground">
          Get started with your secure BusinessFlow workspaces.
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

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label
              htmlFor="firstName"
              className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block"
            >
              First Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="firstName"
                type="text"
                placeholder="John"
                disabled={isSubmitting}
                hasError={!!errors.firstName}
                className="pl-10"
                {...register("firstName")}
              />
            </div>
            {errors.firstName && (
              <p className="text-xs text-destructive mt-1.5">
                {errors.firstName.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="lastName"
              className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block"
            >
              Last Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
                disabled={isSubmitting}
                hasError={!!errors.lastName}
                className="pl-10"
                {...register("lastName")}
              />
            </div>
            {errors.lastName && (
              <p className="text-xs text-destructive mt-1.5">
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

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

        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block"
          >
            Password
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
            <p className="text-xs text-destructive flex items-center gap-1 mt-1.5">
              <AlertCircle width={12} height={12} />
              <span>{errors.password.message}</span>
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
              <span>Creating Account...</span>
            </div>
          ) : (
            <span className="flex items-center gap-1.5">
              <span>Create Account</span>
              <ArrowRight width={14} height={14} />
            </span>
          )}
        </Button>
      </form>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground mt-4">
        Already have an account?{" "}
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
