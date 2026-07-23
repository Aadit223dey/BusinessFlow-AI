"use client";

import {
  CalendarCheck,
  DollarSign,
  Users,
  UserCheck,
  Briefcase,
  Clock,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { SkeletonLoader } from "@/components/shared/skeleton-loader";

export interface KpiItem {
  id: string;
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  timeframe: string;
  icon: any;
  accentColor: string;
}

const defaultKpis: KpiItem[] = [
  {
    id: "appointments",
    title: "Today's Appointments",
    value: "14",
    change: "+18.2%",
    isPositive: true,
    timeframe: "vs yesterday",
    icon: CalendarCheck,
    accentColor: "from-brand-primary/20 to-indigo-500/10 text-brand-primary",
  },
  {
    id: "revenue",
    title: "Monthly Revenue",
    value: "$28,450",
    change: "+12.5%",
    isPositive: true,
    timeframe: "vs last month",
    icon: DollarSign,
    accentColor: "from-emerald-500/20 to-teal-500/10 text-emerald-500",
  },
  {
    id: "customers",
    title: "Active Customers",
    value: "1,248",
    change: "+8.4%",
    isPositive: true,
    timeframe: "vs last month",
    icon: Users,
    accentColor: "from-blue-500/20 to-cyan-500/10 text-blue-500",
  },
  {
    id: "employees",
    title: "Active Employees",
    value: "18",
    change: "0%",
    isPositive: true,
    timeframe: "active now",
    icon: UserCheck,
    accentColor: "from-violet-500/20 to-purple-500/10 text-violet-500",
  },
  {
    id: "services",
    title: "Active Services",
    value: "32",
    change: "+2 new",
    isPositive: true,
    timeframe: "catalog total",
    icon: Briefcase,
    accentColor: "from-amber-500/20 to-orange-500/10 text-amber-500",
  },
  {
    id: "pending",
    title: "Pending Payments",
    value: "$3,120",
    change: "-4.1%",
    isPositive: false,
    timeframe: "6 invoices pending",
    icon: Clock,
    accentColor: "from-rose-500/20 to-red-500/10 text-rose-500",
  },
];

interface KpiGridProps {
  data?: KpiItem[];
  isLoading?: boolean;
}

export function KpiGrid({ data = defaultKpis, isLoading = false }: KpiGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border/50 bg-card/60 p-5 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <SkeletonLoader className="h-4 w-24" />
              <SkeletonLoader className="h-8 w-8 rounded-xl" />
            </div>
            <SkeletonLoader className="h-8 w-20" />
            <SkeletonLoader className="h-3 w-16" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {data.map((kpi) => {
        const Icon = kpi.icon;
        const TrendIcon = kpi.isPositive ? TrendingUp : TrendingDown;

        return (
          <div
            key={kpi.id}
            className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/70 p-5 shadow-sm backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
          >
            {/* Top Row: Title + Icon */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-muted-foreground truncate">
                {kpi.title}
              </span>
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br border border-white/5 shadow-xs ${kpi.accentColor}`}
              >
                <Icon className="h-4.5 w-4.5" />
              </div>
            </div>

            {/* Value */}
            <div className="mt-2.5">
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {kpi.value}
              </p>
            </div>

            {/* Bottom Row: Trend percentage + Timeframe */}
            <div className="mt-2 flex items-center gap-1.5 text-[11px]">
              <span
                className={`inline-flex items-center gap-0.5 font-bold ${
                  kpi.isPositive ? "text-emerald-500" : "text-rose-500"
                }`}
              >
                <TrendIcon className="h-3 w-3" />
                {kpi.change}
              </span>
              <span className="text-muted-foreground/80 truncate">
                {kpi.timeframe}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
