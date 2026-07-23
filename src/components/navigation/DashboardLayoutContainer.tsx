"use client";

import { useSidebarStore } from "@/hooks/use-sidebar-store";

interface DashboardLayoutContainerProps {
  children: React.ReactNode;
}

export function DashboardLayoutContainer({
  children,
}: DashboardLayoutContainerProps) {
  const { isCollapsed } = useSidebarStore();

  return (
    <div
      className={`
        flex min-h-screen flex-col pt-16 transition-all duration-300 ease-in-out
        ${isCollapsed ? "lg:pl-[72px]" : "lg:pl-[260px]"}
      `}
    >
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
        {children}
      </main>
    </div>
  );
}
