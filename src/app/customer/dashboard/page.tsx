"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/providers/auth-provider";
import { CustomerErrorBoundary } from "@/components/shared/CustomerErrorBoundary";
import { CustomerWelcomeHero } from "@/features/customer/components/CustomerWelcomeHero";
import { CustomerSummaryMetrics } from "@/features/customer/components/CustomerSummaryMetrics";
import { UpcomingAppointmentsCard } from "@/features/customer/components/UpcomingAppointmentsCard";
import { CustomerActivityFeed } from "@/features/customer/components/CustomerActivityFeed";
import { ConnectedBusinessesGrid } from "@/features/customer/components/ConnectedBusinessesGrid";
import { LoyaltyRewardsCard } from "@/features/customer/components/LoyaltyRewardsCard";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export default function CustomerDashboardPage() {
  const { profile, user, isLoading } = useAuth();
  const [forceRender, setForceRender] = useState(false);

  // Hard 800ms safety timeout: guarantee the page mounts regardless of auth provider loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setForceRender(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    console.log("🔍 [DIAGNOSTIC 5/7] Auth Context State in Dashboard:", {
      userId: user?.id,
      role: profile?.role,
      tenantId: profile?.tenant_id ?? "NULL (Valid for Customer)",
      isLoading,
      forceRender,
      isReady: (!isLoading || forceRender),
    });
  }, [user, profile, isLoading, forceRender]);

  useEffect(() => {
    if (!isLoading || forceRender) {
      console.log("🔍 [DIAGNOSTIC 6/7] Dashboard Page Component Mounted", {
        userId: user?.id,
        firstName: profile?.first_name,
        tenantId: profile?.tenant_id ?? "NULL",
        timestamp: Date.now(),
      });
    }
  }, [isLoading, forceRender, user, profile]);

  const firstName = profile?.first_name
    || (user?.email ? user.email.split("@")[0] : "there");

  // Show skeleton only during the first 800ms IF auth is strictly loading and we have no user/profile yet
  const isHydrating = isLoading && !forceRender && !user && !profile;

  if (isHydrating) {
    return (
      <div className="space-y-6 animate-pulse p-2">
        <div className="h-40 rounded-2xl bg-slate-200/60 dark:bg-slate-800/40" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-200/60 dark:bg-slate-800/40" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 rounded-2xl bg-slate-200/60 dark:bg-slate-800/40" />
          <div className="h-64 rounded-2xl bg-slate-200/60 dark:bg-slate-800/40" />
        </div>
      </div>
    );
  }

  return (
    <CustomerErrorBoundary moduleName="Customer Dashboard">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        <CustomerWelcomeHero firstName={firstName} />

        <CustomerSummaryMetrics
          stats={{
            upcomingBookings: 0,
            completedServices: 0,
            connectedBusinesses: 0,
            activeInvoices: 0,
          }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UpcomingAppointmentsCard userId={user?.id} />
          <CustomerActivityFeed userId={user?.id} />
        </div>

        <ConnectedBusinessesGrid userId={user?.id} />
        <LoyaltyRewardsCard />
      </motion.div>
    </CustomerErrorBoundary>
  );
}
