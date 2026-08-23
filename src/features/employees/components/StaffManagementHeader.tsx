"use client";

import { Button } from '@/components/ui/button';
import { Users, Plus, RefreshCw, UserCheck, UserPlus, UsersRound } from 'lucide-react';

interface StaffManagementHeaderProps {
  totalMembers: number;
  activeCount: number;
  pendingInvites: number;
  isLoading: boolean;
  onInviteClick: () => void;
  onRefresh: () => void;
}

export function StaffManagementHeader({
  totalMembers,
  activeCount,
  pendingInvites,
  isLoading,
  onInviteClick,
  onRefresh,
}: StaffManagementHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between border-b border-border pb-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Users className="h-3.5 w-3.5" />
            <span>Workspace Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2 text-foreground">
            Staff & Team Management 👥
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Invite employees, manage team roles, configure access permissions, and monitor staff activity.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5 text-sm">
            <UsersRound className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Total Members:</span>
            <span className="font-semibold text-foreground">{totalMembers}</span>
          </div>
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg px-3 py-1.5 text-sm">
            <UserCheck className="h-4 w-4" />
            <span>Active:</span>
            <span className="font-semibold">{activeCount}</span>
          </div>
          {pendingInvites > 0 && (
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg px-3 py-1.5 text-sm">
              <UserPlus className="h-4 w-4" />
              <span>Pending Invites:</span>
              <span className="font-semibold">{pendingInvites}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
        <Button onClick={onInviteClick} className="shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4 mr-2" />
          + Invite Staff
        </Button>
      </div>
    </div>
  );
}
