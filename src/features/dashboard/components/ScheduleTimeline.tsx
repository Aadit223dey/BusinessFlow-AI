"use client";

import { CalendarCheck, Clock, User, CheckCircle2, AlertCircle, PlayCircle } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

export interface ScheduleItem {
  id: string;
  time: string;
  customerName: string;
  serviceName: string;
  staffName: string;
  status: "CONFIRMED" | "IN_PROGRESS" | "PENDING";
  duration: string;
}

const defaultSchedule: ScheduleItem[] = [
  {
    id: "sch-1",
    time: "09:00 AM",
    customerName: "Sarah Jenkins",
    serviceName: "Full Business Audit & Setup",
    staffName: "Alex Rivera",
    status: "CONFIRMED",
    duration: "60 mins",
  },
  {
    id: "sch-2",
    time: "10:30 AM",
    customerName: "Marcus Vance",
    serviceName: "Executive Strategy Consultation",
    staffName: "Elena Rostova",
    status: "IN_PROGRESS",
    duration: "45 mins",
  },
  {
    id: "sch-3",
    time: "01:15 PM",
    customerName: "David Sterling",
    serviceName: "Financial Systems Integration",
    staffName: "Alex Rivera",
    status: "PENDING",
    duration: "90 mins",
  },
  {
    id: "sch-4",
    time: "03:45 PM",
    customerName: "Claire Dupont",
    serviceName: "AI Automation Workflow Review",
    staffName: "Marcus Vance",
    status: "CONFIRMED",
    duration: "30 mins",
  },
];

interface ScheduleTimelineProps {
  items?: ScheduleItem[];
}

export function ScheduleTimeline({ items = defaultSchedule }: ScheduleTimelineProps) {
  if (!items || items.length === 0) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card/70 p-6 shadow-sm backdrop-blur-md">
        <EmptyState
          title="No Appointments Scheduled Today"
          description="Your schedule is completely clear for the remainder of today."
          actionLabel="Book Appointment"
          onActionTrigger={() => {}}
        />
      </div>
    );
  }

  const getStatusBadge = (status: ScheduleItem["status"]) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-500">
            <CheckCircle2 className="h-3 w-3" />
            Confirmed
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 text-[10px] font-bold text-blue-500">
            <PlayCircle className="h-3 w-3 animate-pulse" />
            In Progress
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-500">
            <AlertCircle className="h-3 w-3" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card/70 p-6 shadow-sm backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-5 border-b border-border/40 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CalendarCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Today's Schedule Agenda</h3>
            <p className="text-xs text-muted-foreground">
              {items.length} booking{items.length !== 1 ? "s" : ""} scheduled
            </p>
          </div>
        </div>
      </div>

      {/* Timeline items */}
      <div className="relative space-y-4 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60">
        {items.map((item) => (
          <div
            key={item.id}
            className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 pl-8 rounded-xl border border-border/40 bg-muted/20 p-3.5 transition-all hover:bg-muted/50 hover:border-primary/30"
          >
            {/* Dot marker */}
            <span className="absolute left-[9px] top-4 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-card transition-transform group-hover:scale-125" />

            {/* Content Left */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-primary flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {item.time}
                </span>
                <span className="text-[10px] font-medium text-muted-foreground">
                  ({item.duration})
                </span>
              </div>
              <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                {item.customerName}
              </h4>
              <p className="text-xs text-muted-foreground">{item.serviceName}</p>
            </div>

            {/* Right details & badge */}
            <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 shrink-0">
              {getStatusBadge(item.status)}
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <User className="h-3 w-3" />
                {item.staffName}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
