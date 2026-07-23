"use client";

import { Sparkles, ArrowRight, Lightbulb, Zap, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

const insights = [
  {
    id: "ins-1",
    title: "Schedule Optimization Opportunity",
    category: "Efficiency",
    description: "Friday afternoons have a 35% gap in booking density. Offering a 10% off-peak discount could capture ~$1,200/mo extra revenue.",
    icon: Lightbulb,
    badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    actionLabel: "Apply Smart Discount",
  },
  {
    id: "ins-2",
    title: "Customer Retention Alert",
    category: "Growth",
    description: "14 high-value customers haven't booked an appointment in over 45 days. Trigger an automated re-engagement campaign.",
    icon: Zap,
    badgeColor: "bg-brand-primary/10 text-brand-primary border-brand-primary/20",
    actionLabel: "Launch Re-engagement",
  },
  {
    id: "ins-3",
    title: "Revenue Forecast Projection",
    category: "Financials",
    description: "Based on current booking velocity, Q3 revenue is projected to exceed baseline targets by +14.8%.",
    icon: TrendingUp,
    badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    actionLabel: "Explore Forecast",
  },
];

export function AiInsightsZone() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/70 p-6 shadow-sm backdrop-blur-md">
      <div className="flex items-center justify-between gap-4 mb-4 border-b border-border/40 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-primary to-indigo-600 text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              BusinessFlow AI Insights Engine
            </h3>
          </div>
        </div>
        <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary">
          Live Recommendations
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {insights.map((ins) => {
          const Icon = ins.icon;
          return (
            <div
              key={ins.id}
              className="flex flex-col justify-between rounded-xl border border-border/40 bg-muted/20 p-4 transition-all hover:bg-muted/40 hover:border-primary/30"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${ins.badgeColor}`}
                  >
                    <Icon className="h-3 w-3" />
                    {ins.category}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-foreground mb-1.5">
                  {ins.title}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {ins.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border/30 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    toast.info("AI Action Triggered", {
                      description: `Action "${ins.actionLabel}" initiated successfully.`,
                    })
                  }
                  className="text-xs font-semibold gap-1.5 text-primary hover:text-primary-dark"
                >
                  <span>{ins.actionLabel}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
