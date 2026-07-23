"use client";

import Link from "next/link";
import {
  Users,
  UserCheck,
  Briefcase,
  CalendarCheck,
  Calendar,
  FileText,
  Package,
  BarChart3,
  Sparkles,
  Settings,
  ArrowLeft,
  Clock,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const iconMap: Record<string, LucideIcon> = {
  users: Users,
  employees: UserCheck,
  services: Briefcase,
  appointments: CalendarCheck,
  calendar: Calendar,
  invoices: FileText,
  inventory: Package,
  reports: BarChart3,
  "ai-insights": Sparkles,
  settings: Settings,
};

interface ComingSoonProps {
  moduleName: string;
  description?: string;
  iconName?: keyof typeof iconMap | string;
  sprintBadge?: string;
}

export function ComingSoon({
  moduleName,
  description = "This operational module is scheduled for full backend integration in an upcoming sprint release.",
  iconName = "ai-insights",
  sprintBadge = "Planned Module",
}: ComingSoonProps) {
  const Icon = iconMap[iconName] || Sparkles;

  return (
    <div className="flex flex-1 items-center justify-center p-6 min-h-[70vh]">
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-8 sm:p-10 shadow-premium backdrop-blur-xl transition-all duration-300">
        {/* Background ambient glow effect */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-brand-electric/10 blur-3xl" />

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <Clock className="h-3.5 w-3.5" />
            <span>{sprintBadge}</span>
          </div>

          {/* Module Icon Container */}
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-brand-electric/15 border border-primary/20 text-primary shadow-sm">
            <Icon className="h-8 w-8 text-primary" />
          </div>

          {/* Title & Description */}
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {moduleName} Module
          </h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-md">
            {description}
          </p>

          {/* Features roadmap list preview */}
          <div className="my-6 w-full rounded-xl border border-border/40 bg-muted/40 p-4 text-left">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Planned Capability Scope
            </p>
            <ul className="space-y-1.5 text-xs text-foreground/80">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Multi-tenant isolated data tables & RLS policies
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Real-time CRUD operations & automated workflow triggers
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                AI-assisted analytics & export management
              </li>
            </ul>
          </div>

          {/* Return to Dashboard Action */}
          <Link href="/dashboard">
            <Button variant="primary" size="default" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Dashboard</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
