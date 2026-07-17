"use client";

import { useState, useCallback, useEffect } from "react";
import type { OnboardingFormData } from "@/features/onboarding/schemas/onboarding-schemas";
import { DEFAULT_ONBOARDING_DATA } from "@/features/onboarding/schemas/onboarding-schemas";

/**
 * Draft State Persistence Hook
 *
 * Saves onboarding wizard form entries to browser sessionStorage
 * using temporary state schemas. Prevents layout data loss from
 * accidental navigation resets or page refreshes.
 */

const STORAGE_KEY = "businessflow_onboarding_draft";
const STEP_KEY = "businessflow_onboarding_step";

interface UseOnboardingDraftReturn {
  formData: OnboardingFormData;
  currentStep: number;
  updateStepData: <K extends keyof OnboardingFormData>(
    stepKey: K,
    data: OnboardingFormData[K]
  ) => void;
  setCurrentStep: (step: number) => void;
  clearDraft: () => void;
}

function loadDraft(): OnboardingFormData {
  if (typeof window === "undefined") return DEFAULT_ONBOARDING_DATA;
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<OnboardingFormData>;
      return { ...DEFAULT_ONBOARDING_DATA, ...parsed };
    }
  } catch {
    // Corrupted data — reset
    sessionStorage.removeItem(STORAGE_KEY);
  }
  return DEFAULT_ONBOARDING_DATA;
}

function loadStep(): number {
  if (typeof window === "undefined") return 0;
  try {
    const stored = sessionStorage.getItem(STEP_KEY);
    if (stored) {
      const step = parseInt(stored, 10);
      return isNaN(step) ? 0 : Math.max(0, Math.min(7, step));
    }
  } catch {
    sessionStorage.removeItem(STEP_KEY);
  }
  return 0;
}

export function useOnboardingDraft(): UseOnboardingDraftReturn {
  const [formData, setFormData] = useState<OnboardingFormData>(DEFAULT_ONBOARDING_DATA);
  const [currentStep, setCurrentStepState] = useState<number>(0);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from sessionStorage on mount
  useEffect(() => {
    setFormData(loadDraft());
    setCurrentStepState(loadStep());
    setIsHydrated(true);
  }, []);

  // Persist formData to sessionStorage
  useEffect(() => {
    if (!isHydrated) return;
    try {
      // Strip File objects (non-serializable) from logoUpload before saving
      const serializable = {
        ...formData,
        logoUpload: {},
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
    } catch {
      // Storage full or unavailable — silent fail
    }
  }, [formData, isHydrated]);

  // Persist current step
  useEffect(() => {
    if (!isHydrated) return;
    try {
      sessionStorage.setItem(STEP_KEY, String(currentStep));
    } catch {
      // Silent fail
    }
  }, [currentStep, isHydrated]);

  const updateStepData = useCallback(
    <K extends keyof OnboardingFormData>(
      stepKey: K,
      data: OnboardingFormData[K]
    ) => {
      setFormData((prev) => ({
        ...prev,
        [stepKey]: data,
      }));
    },
    []
  );

  const setCurrentStep = useCallback((step: number) => {
    setCurrentStepState(Math.max(0, Math.min(7, step)));
  }, []);

  const clearDraft = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STEP_KEY);
    setFormData(DEFAULT_ONBOARDING_DATA);
    setCurrentStepState(0);
  }, []);

  return {
    formData,
    currentStep,
    updateStepData,
    setCurrentStep,
    clearDraft,
  };
}
