"use client";

import { motion } from "framer-motion";
import {
  Building2,
  Phone,
  MapPin,
  Globe,
  Clock,
  CalendarClock,
  ImagePlus,
  CheckCircle,
  Check,
} from "lucide-react";
import { ONBOARDING_STEPS } from "@/features/onboarding/schemas/onboarding-schemas";

/**
 * Onboarding Progress Track
 *
 * Renders a vertical step indicator with animated transitions,
 * showing completed, active, and upcoming wizard steps.
 */

interface OnboardingProgressProps {
  currentStep: number;
  completedSteps: Set<number>;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Building2,
  Phone,
  MapPin,
  Globe,
  Clock,
  CalendarClock,
  ImagePlus,
  CheckCircle,
};

export function OnboardingProgress({
  currentStep,
  completedSteps,
}: OnboardingProgressProps) {
  return (
    <nav aria-label="Onboarding progress" className="relative">
      <ol className="relative space-y-1">
        {ONBOARDING_STEPS.map((step, index) => {
          const isCompleted = completedSteps.has(index);
          const isCurrent = currentStep === index;
          const isPending = !isCompleted && !isCurrent;
          const IconComponent = ICON_MAP[step.icon];

          return (
            <li key={step.id} className="relative">
              <div
                className={`
                  flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200
                  ${isCurrent ? "bg-brand-primary/10" : ""}
                  ${isCompleted ? "opacity-80" : ""}
                  ${isPending ? "opacity-40" : ""}
                `}
              >
                {/* Step indicator circle */}
                <motion.div
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1.1 : 1,
                    backgroundColor: isCompleted
                      ? "rgb(16 185 129)"
                      : isCurrent
                      ? "rgb(79 70 229)"
                      : "rgb(30 41 59)",
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    >
                      <Check className="h-4 w-4 text-white" />
                    </motion.div>
                  ) : IconComponent ? (
                    <IconComponent className="h-4 w-4 text-white" />
                  ) : null}

                  {/* Active pulse ring */}
                  {isCurrent && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: [0, 0.3, 0], scale: [0.8, 1.4, 1.6] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute inset-0 rounded-full border-2 border-brand-primary"
                    />
                  )}
                </motion.div>

                {/* Step text */}
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-medium truncate ${
                      isCurrent
                        ? "text-white"
                        : isCompleted
                        ? "text-slate-300"
                        : "text-slate-500"
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {step.description}
                  </p>
                </div>

                {/* Step number badge */}
                <span
                  className={`text-[10px] font-bold tabular-nums ${
                    isCurrent ? "text-brand-primary" : "text-slate-600"
                  }`}
                >
                  {index + 1}/{ONBOARDING_STEPS.length}
                </span>
              </div>

              {/* Connector line */}
              {index < ONBOARDING_STEPS.length - 1 && (
                <div className="ml-[22px] h-1 w-px bg-slate-700/50" />
              )}
            </li>
          );
        })}
      </ol>

      {/* Overall progress bar */}
      <div className="mt-4 overflow-hidden rounded-full bg-slate-800 h-1.5">
        <motion.div
          initial={{ width: 0 }}
          animate={{
            width: `${((completedSteps.size) / ONBOARDING_STEPS.length) * 100}%`,
          }}
          transition={{ type: "spring", stiffness: 200, damping: 30 }}
          className="h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-electric"
        />
      </div>
    </nav>
  );
}
