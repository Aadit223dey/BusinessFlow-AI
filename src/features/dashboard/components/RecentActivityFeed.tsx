"use client";

import { Activity, UserPlus, CalendarCheck, FileText, CheckCircle } from "lucide-react";

export interface ActivityItem {
  id: string;
  type: "APPOINTMENT" | "CUSTOMER" | "INVOICE" | "SYSTEM";
  title: string;
  timestamp: string;
  actor: string;
}

const mockActivities: ActivityItem[] = [
  {
    id: "act-1",
    type: "APPOINTMENT",
    title: "Appointment confirmed with Sarah Jenkins",
    timestamp: "12 minutes ago",
    actor: "Alex Rivera",
  },
  {
    id: "act-2",
    type: "CUSTOMER",
    title: "New customer profile created for Marcus Vance",
    timestamp: "45 minutes ago",
    actor: "System",
  },
  {
    id: "act-3",
    type: "INVOICE",
    title: "Invoice #INV-2026-089 paid ($450.00)",
    timestamp: "2 hours ago",
    actor: "David Sterling",
  },
  {
    id: "act-4",
    type: "SYSTEM",
    title: "Working hours updated for Friday schedule",
    timestamp: "4 hours ago",
    actor: "Workspace Admin",
  },
];

export function RecentActivityFeed() {
  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "APPOINTMENT":
        return <CalendarCheck className="h-3.5 w-3.5 text-primary" />;
      case "CUSTOMER":
        return <UserPlus className="h-3.5 w-3.5 text-emerald-500" />;
      case "INVOICE":
        return <FileText className="h-3.5 w-3.5 text-blue-500" />;
      case "SYSTEM":
        return <CheckCircle className="h-3.5 w-3.5 text-violet-500" />;
    }
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card/70 p-6 shadow-sm backdrop-blur-md">
      <div className="flex items-center justify-between gap-4 mb-4 border-b border-border/40 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Activity className="h-4 w-4" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Recent Activity Log
          </h3>
        </div>
        <span className="text-[11px] font-semibold text-primary cursor-pointer hover:underline">
          View All
        </span>
      </div>

      <div className="space-y-3">
        {mockActivities.map((act) => (
          <div
            key={act.id}
            className="flex items-start gap-3 rounded-xl border border-border/30 bg-muted/20 p-3 transition-colors hover:bg-muted/40"
          >
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border/40 bg-card">
              {getActivityIcon(act.type)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-foreground">
                {act.title}
              </p>
              <div className="mt-0.5 flex items-center justify-between text-[10px] text-muted-foreground">
                <span>By {act.actor}</span>
                <span>{act.timestamp}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
