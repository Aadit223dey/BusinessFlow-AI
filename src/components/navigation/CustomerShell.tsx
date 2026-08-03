"use client";

import { useEffect } from "react";
import { CustomerSidebar } from "@/components/navigation/CustomerSidebar";
import { CustomerTopNav } from "@/components/navigation/CustomerTopNav";
import { CustomerLayoutContainer } from "@/components/navigation/CustomerLayoutContainer";

interface CustomerShellProps {
  userName: string;
  userEmail: string;
  avatarUrl: string | null;
  children: React.ReactNode;
}

export function CustomerShell({ userName, userEmail, avatarUrl, children }: CustomerShellProps) {
  useEffect(() => {
    console.log("🔍 [DIAGNOSTIC 4/7] Customer Layout Shell Mounted Successfully", {
      userName,
      timestamp: Date.now(),
    });
  }, [userName]);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/80 text-foreground transition-colors duration-300">
      <CustomerSidebar />
      <CustomerTopNav
        userName={userName}
        userEmail={userEmail}
        avatarUrl={avatarUrl}
      />
      <CustomerLayoutContainer>{children}</CustomerLayoutContainer>
    </div>
  );
}
