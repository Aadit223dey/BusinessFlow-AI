import type { Metadata } from "next";

/**
 * Onboarding Layout Shell
 *
 * Clean layout view without dashboard navigation elements.
 * Active only until setup verification flags are completed.
 * Uses a minimal, distraction-free structure.
 */

export const metadata: Metadata = {
  title: "Setup Your Workspace",
  description: "Configure your BusinessFlow AI workspace in a few simple steps.",
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-background">
      {/* Ambient background effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-brand-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-brand-electric/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-brand-primary/3 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
