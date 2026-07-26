"use client";

import { useEffect, useState } from "react";
import { UserPlus, RefreshCw, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/auth-provider";
import { type Invitation, type UserProfile } from "@/types";
import { InviteStaffModal } from "@/features/employees/components/InviteStaffModal";
import { PendingInvitationsTable } from "@/features/employees/components/PendingInvitationsTable";

export default function EmployeesPage() {
  const { profile } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [activeStaff, setActiveStaff] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const fetchStaffData = async () => {
    setIsLoading(true);
    try {
      if (!profile?.tenant_id) return;

      // 1. Fetch pending invitations for tenant
      const { data: inviteData } = await supabase
        .from("invitations")
        .select("*")
        .eq("tenant_id", profile.tenant_id)
        .order("created_at", { ascending: false });

      if (inviteData) {
        setInvitations(inviteData as Invitation[]);
      }

      // 2. Fetch active staff members for tenant
      const { data: staffData } = await supabase
        .from("profiles")
        .select("*")
        .eq("tenant_id", profile.tenant_id)
        .eq("role", "STAFF");

      if (staffData) {
        setActiveStaff(staffData as UserProfile[]);
      }
    } catch (err) {
      console.error("Error loading staff workspace data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.tenant_id) {
      fetchStaffData();
    }
  }, [profile?.tenant_id]);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header View */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-2">
            <Users className="h-3.5 w-3.5" />
            <span>Workspace Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Staff Management 👥
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Invite employees, manage team access, and view staff invitation statuses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchStaffData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={() => setIsInviteModalOpen(true)} className="shadow-lg shadow-primary/20">
            <UserPlus className="h-4 w-4 mr-2" />
            + Invite Staff Member
          </Button>
        </div>
      </div>

      {/* Staff & Invitation Table */}
      <PendingInvitationsTable
        invitations={invitations}
        activeStaff={activeStaff}
        isLoading={isLoading}
        onRefresh={fetchStaffData}
      />

      {/* Invite Modal Drawer */}
      <InviteStaffModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={fetchStaffData}
      />
    </div>
  );
}
