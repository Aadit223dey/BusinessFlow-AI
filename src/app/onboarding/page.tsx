"use client";

import { useState, useCallback, useMemo, Suspense } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useOnboardingDraft } from "@/features/onboarding/hooks/use-onboarding-draft";
import { WizardSteps } from "@/features/onboarding/components/WizardSteps";
import { OnboardingProgress } from "@/features/onboarding/components/OnboardingProgress";
import { BusinessPreviewCard } from "@/features/onboarding/components/BusinessPreviewCard";
import { ONBOARDING_STEPS } from "@/features/onboarding/schemas/onboarding-schemas";
import type { OnboardingFormData } from "@/features/onboarding/schemas/onboarding-schemas";
import { supabase } from "@/lib/supabase";
import { ThemeToggle } from "@/components/ui/theme-toggle";

/**
 * 8-Step Workspace Setup Wizard Dashboard
 *
 * Coordinates step visibility matrices, tracks form data entries,
 * manages final backend submission requests, and handles
 * file uploads to Supabase Storage.
 */

function OnboardingWizard() {
  const router = useRouter();
  const { formData, currentStep, updateStepData, setCurrentStep, clearDraft } =
    useOnboardingDraft();

  const [direction, setDirection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);

  // Track which steps have been completed
  const completedSteps = useMemo(() => {
    const completed = new Set<number>();
    // Mark steps as completed if they have valid data
    if (formData.businessIdentity.businessName && formData.businessIdentity.category) {
      completed.add(0);
    }
    if (formData.contactInfo.email && formData.contactInfo.phone) {
      completed.add(1);
    }
    if (formData.businessAddress.city && formData.businessAddress.state && formData.businessAddress.addressLine1) {
      completed.add(2);
    }
    if (formData.regionalSettings.currency && formData.regionalSettings.timezone) {
      completed.add(3);
    }
    if (Object.values(formData.workingHours).some((d) => d.enabled)) {
      completed.add(4);
    }
    if (formData.appointmentSettings.appointmentDuration > 0) {
      completed.add(5);
    }
    // Logo is optional, always complete
    if (currentStep > 6) {
      completed.add(6);
    }
    return completed;
  }, [formData, currentStep]);

  const handleStepSubmit = useCallback(
    (
      stepKey: keyof OnboardingFormData,
      data: OnboardingFormData[keyof OnboardingFormData]
    ) => {
      updateStepData(stepKey, data);
      setDirection(1);
      setCurrentStep(Math.min(currentStep + 1, ONBOARDING_STEPS.length - 1));
    },
    [currentStep, setCurrentStep, updateStepData]
  );

  const handleBack = useCallback(() => {
    setDirection(-1);
    setCurrentStep(Math.max(currentStep - 1, 0));
  }, [currentStep, setCurrentStep]);

  const handleLogoChange = useCallback((file: File | null) => {
    setLogoFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoPreviewUrl(url);
    } else {
      setLogoPreviewUrl(null);
    }
  }, []);

  const handleFinalSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Upload logo if provided
      let logoUrl: string | null = null;
      if (logoFile) {
        const fileExt = logoFile.name.split(".").pop();
        const fileName = `logos/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("business_assets")
          .upload(fileName, logoFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("Logo upload failed:", uploadError.message);
          // Non-blocking — continue without logo
        } else {
          const { data: publicUrlData } = supabase.storage
            .from("business_assets")
            .getPublicUrl(fileName);
          logoUrl = publicUrlData.publicUrl;
        }
      }

      // Submit to API
      const response = await fetch("/api/onboarding/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: formData.businessIdentity.businessName,
          category: formData.businessIdentity.category,
          email: formData.contactInfo.email,
          phone: formData.contactInfo.phone,
          addressLine1: formData.businessAddress.addressLine1,
          addressLine2: formData.businessAddress.addressLine2,
          city: formData.businessAddress.city,
          state: formData.businessAddress.state,
          postalCode: formData.businessAddress.postalCode,
          country: formData.businessAddress.country,
          currency: formData.regionalSettings.currency,
          timezone: formData.regionalSettings.timezone,
          workingHours: formData.workingHours,
          appointmentDuration: formData.appointmentSettings.appointmentDuration,
          bufferTime: formData.appointmentSettings.bufferTime,
          maxAdvanceBookingDays: formData.appointmentSettings.maxAdvanceBookingDays,
          logoUrl,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Submission failed");
      }

      // Clear draft state and redirect
      clearDraft();
      router.push(result.redirectTo || "/dashboard");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setSubmitError(message);
      setIsSubmitting(false);
    }
  }, [formData, logoFile, clearDraft, router]);

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-8 lg:flex-row lg:gap-8 lg:py-12">
      {/* Left sidebar — Progress & Preview */}
      <div className="mb-8 w-full shrink-0 lg:mb-0 lg:w-80">
        <div className="sticky top-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-primary to-brand-electric">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Setup Wizard</h1>
                <p className="text-xs text-muted-foreground">BusinessFlow AI</p>
              </div>
            </div>
            <ThemeToggle />
          </div>

          {/* Progress */}
          <OnboardingProgress
            currentStep={currentStep}
            completedSteps={completedSteps}
          />

          {/* Preview card — hidden on mobile */}
          <div className="hidden lg:block">
            <BusinessPreviewCard
              data={formData}
              logoPreviewUrl={logoPreviewUrl}
            />
          </div>
        </div>
      </div>

      {/* Main content — Wizard steps */}
      <div className="flex flex-1 flex-col">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex-1 rounded-2xl border border-white/10 bg-card/50 p-6 shadow-2xl backdrop-blur-sm sm:p-8"
        >
          <WizardSteps
            formData={formData}
            currentStep={currentStep}
            direction={direction}
            logoPreviewUrl={logoPreviewUrl}
            isSubmitting={isSubmitting}
            onStepSubmit={handleStepSubmit}
            onBack={handleBack}
            onLogoChange={handleLogoChange}
            onFinalSubmit={handleFinalSubmit}
          />

          {/* Error banner */}
          {submitError && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3"
            >
              <p className="text-sm text-destructive">{submitError}</p>
            </motion.div>
          )}
        </motion.div>

        {/* Mobile preview card */}
        <div className="mt-6 lg:hidden">
          <BusinessPreviewCard
            data={formData}
            logoPreviewUrl={logoPreviewUrl}
          />
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
        </div>
      }
    >
      <OnboardingWizard />
    </Suspense>
  );
}
