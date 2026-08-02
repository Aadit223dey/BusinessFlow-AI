"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/providers/auth-provider";
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
      staggerChildren: 0.1
    }
  }
};

export default function CustomerDashboardPage() {
  const { profile, user, isLoading } = useAuth();

  useEffect(() => {
    console.log("🔍 [DIAGNOSTIC] Customer Dashboard: Page Mounted", {
      profileLoaded: !!profile,
      userId: user?.id,
      isLoading,
      timestamp: Date.now(),
    });
  }, [profile, user, isLoading]);

  const firstName = profile?.first_name || (user?.email ? user.email.split("@")[0] : 'there');

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <CustomerWelcomeHero firstName={firstName} isLoadingProfile={isLoading && !profile} />
      
      <CustomerSummaryMetrics 
        stats={{ 
          upcomingBookings: 0, 
          completedServices: 0, 
          connectedBusinesses: 0, 
          activeInvoices: 0 
        }} 
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingAppointmentsCard userId={user?.id} />
        <CustomerActivityFeed userId={user?.id} />
      </div>
      
      <ConnectedBusinessesGrid userId={user?.id} />
      <LoyaltyRewardsCard />
    </motion.div>
  );
}
