"use client";

import { Button } from "@/components/ui/button";
import { Plus, Briefcase, Sparkles } from "lucide-react";

interface ServiceManagementHeaderProps {
  totalCount: number;
  activeCount: number;
  onAddService: () => void;
}

export function ServiceManagementHeader({
  totalCount,
  activeCount,
  onAddService,
}: ServiceManagementHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary dark:bg-indigo-500/15 dark:text-indigo-400">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Services & Offerings
              </h1>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary/10 dark:bg-indigo-500/15 px-3 py-1 text-xs font-bold text-brand-primary dark:text-indigo-400">
                <Sparkles className="h-3 w-3" />
                <span>
                  {activeCount} Active / {totalCount} Total
                </span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Manage your service menu, pricing tiers, session durations, and online booking visibility.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 self-start sm:self-auto">
        <Button
          variant="primary"
          size="default"
          onClick={onAddService}
          className="rounded-xl px-4 font-bold gap-2 shadow-md shadow-brand-primary/20"
        >
          <Plus className="h-4 w-4" />
          <span>Add Service</span>
        </Button>
      </div>
    </div>
  );
}
