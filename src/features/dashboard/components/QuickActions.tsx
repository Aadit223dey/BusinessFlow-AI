"use client";

import { useState } from "react";
import {
  CalendarPlus,
  UserPlus,
  UserCheck,
  FilePlus,
  PlusCircle,
  Sparkles,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";

interface ActionConfig {
  id: string;
  title: string;
  description: string;
  icon: any;
  sprintTarget: string;
  fields: Array<{ label: string; placeholder: string; type?: string }>;
}

const actions: ActionConfig[] = [
  {
    id: "appointment",
    title: "New Appointment",
    description: "Schedule a new appointment booking for a customer",
    icon: CalendarPlus,
    sprintTarget: "Sprint 5 (Appointments Module)",
    fields: [
      { label: "Customer Name", placeholder: "e.g., Sarah Connor" },
      { label: "Service", placeholder: "Select service..." },
      { label: "Date & Time", placeholder: "2026-07-25 14:00", type: "datetime-local" },
      { label: "Assigned Staff", placeholder: "Select staff member..." },
    ],
  },
  {
    id: "customer",
    title: "Add Customer",
    description: "Create a new customer profile record",
    icon: UserPlus,
    sprintTarget: "Sprint 5 (Customers Module)",
    fields: [
      { label: "Full Name", placeholder: "Jane Doe" },
      { label: "Email Address", placeholder: "jane@company.com", type: "email" },
      { label: "Phone Number", placeholder: "+1 (555) 019-2834" },
    ],
  },
  {
    id: "employee",
    title: "Add Employee",
    description: "Add a staff member to your workspace roster",
    icon: UserCheck,
    sprintTarget: "Sprint 6 (Staff Roster Module)",
    fields: [
      { label: "Employee Name", placeholder: "Alex Rivera" },
      { label: "Role / Position", placeholder: "Senior Specialist" },
      { label: "Work Email", placeholder: "alex@business.com", type: "email" },
    ],
  },
  {
    id: "invoice",
    title: "Create Invoice",
    description: "Draft a new customer payment invoice",
    icon: FilePlus,
    sprintTarget: "Sprint 7 (Invoicing Module)",
    fields: [
      { label: "Customer", placeholder: "Select customer..." },
      { label: "Amount ($)", placeholder: "250.00", type: "number" },
      { label: "Due Date", placeholder: "Due on receipt", type: "date" },
    ],
  },
  {
    id: "service",
    title: "Add Service",
    description: "Add a new offering to your service catalog",
    icon: PlusCircle,
    sprintTarget: "Sprint 6 (Services Catalog)",
    fields: [
      { label: "Service Name", placeholder: "Executive Strategy Consultation" },
      { label: "Price ($)", placeholder: "150.00", type: "number" },
      { label: "Duration (minutes)", placeholder: "60", type: "number" },
    ],
  },
];

export function QuickActions() {
  const [activeAction, setActiveAction] = useState<ActionConfig | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAction) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(`${activeAction.title} Saved!`, {
        description: `Full backend database integration arrives in ${activeAction.sprintTarget}.`,
      });
      setActiveAction(null);
    }, 600);
  };

  return (
    <>
      {/* Quick Action Shortcuts Bar */}
      <div className="rounded-2xl border border-border/60 bg-card/70 p-5 shadow-sm backdrop-blur-md">
        <div className="flex items-center justify-between gap-4 mb-3.5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Quick Operational Actions
            </h3>
          </div>
          <span className="text-[11px] text-muted-foreground">
            Contextual Drawers
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-5">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => setActiveAction(action)}
                className="group flex flex-col items-center justify-center rounded-xl border border-border/60 bg-muted/30 p-3.5 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-muted/70 hover:shadow-xs"
              >
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-card border border-border/50 text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                  {action.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contextual Side Drawer */}
      {activeAction && (
        <Drawer
          isOpen={!!activeAction}
          onClose={() => setActiveAction(null)}
          title={activeAction.title}
          description={activeAction.description}
        >
          <form onSubmit={handleActionSubmit} className="space-y-4 pt-4">
            {/* Sprint Target Notification Banner */}
            <div className="rounded-xl border border-primary/20 bg-primary/10 p-3.5 text-xs text-primary">
              <div className="flex items-center gap-2 font-bold mb-1">
                <Clock className="h-4 w-4" />
                <span>{activeAction.sprintTarget}</span>
              </div>
              <p className="text-[11px] text-primary/80 leading-relaxed">
                You can test this layout flow now. Real-time database table persistence will activate in this upcoming release.
              </p>
            </div>

            {/* Dynamic Context Fields */}
            <div className="space-y-3">
              {activeAction.fields.map((field, idx) => (
                <div key={idx} className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    {field.label}
                  </label>
                  <Input
                    type={field.type || "text"}
                    placeholder={field.placeholder}
                    className="w-full"
                    required
                  />
                </div>
              ))}
            </div>

            <div className="pt-4 flex gap-3">
              <Button
                type="button"
                variant="outline"
                size="default"
                className="w-1/2"
                onClick={() => setActiveAction(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="default"
                className="w-1/2"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Entry"}
              </Button>
            </div>
          </form>
        </Drawer>
      )}
    </>
  );
}
