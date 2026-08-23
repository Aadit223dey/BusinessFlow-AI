"use client";

import { useState, useMemo, useEffect } from "react";
import { Users, UserPlus } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { supabase } from "@/lib/supabase";
import { type Invitation, type StaffMemberRecord, type UpdateStaffMemberInput } from "@/types";
import { useStaffManager } from "@/features/employees/hooks/use-staff-manager";
import { StaffManagementHeader } from "@/features/employees/components/StaffManagementHeader";
import { StaffFilterToolbar } from "@/features/employees/components/StaffFilterToolbar";
import { StaffTable } from "@/features/employees/components/StaffTable";
import { StaffCardGrid } from "@/features/employees/components/StaffCardGrid";
import { StaffProfileModal } from "@/features/employees/components/StaffProfileModal";
import { StaffManagementSkeleton } from "@/features/employees/components/StaffManagementSkeleton";
import { InviteStaffModal } from "@/features/employees/components/InviteStaffModal";
import { PendingInvitationsTable } from "@/features/employees/components/PendingInvitationsTable";
import { toast } from "@/components/ui/toast";

export default function EmployeesPage() {
  const { profile } = useAuth();

  // ── Staff Manager Hook ──────────────────────────────────
  const {
    staffMembers,
    isLoading: isStaffLoading,
    refetch: refetchStaff,
    updateStaff,
    isUpdating,
    toggleStatus,
  } = useStaffManager();

  // ── Invitation State (legacy, pending invites) ──────────
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isInvitationsLoading, setIsInvitationsLoading] = useState(true);

  // ── UI State ────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<"STAFF" | "INVITATIONS">("STAFF");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<StaffMemberRecord | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // ── Filter State ────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // ── Fetch Invitations ───────────────────────────────────
  const fetchInvitations = async () => {
    setIsInvitationsLoading(true);
    try {
      const tenantId = profile?.tenant_id || profile?.tenantId;
      if (!tenantId) return;

      const { data: inviteData } = await supabase
        .from("invitations")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });

      if (inviteData) {
        setInvitations(inviteData as Invitation[]);
      }
    } catch (err) {
      console.error("Error loading invitations:", err);
    } finally {
      setIsInvitationsLoading(false);
    }
  };

  useEffect(() => {
    const tenantId = profile?.tenant_id || profile?.tenantId;
    if (tenantId) {
      fetchInvitations();
    }
  }, [profile?.tenant_id, profile?.tenantId]);

  // ── Derived / Filtered Data ─────────────────────────────
  const filteredStaff = useMemo(() => {
    let result = staffMembers;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.profile.firstName?.toLowerCase().includes(q) ||
          m.profile.lastName?.toLowerCase().includes(q) ||
          m.jobTitle.toLowerCase().includes(q) ||
          m.department.toLowerCase().includes(q)
      );
    }

    // Department filter
    if (departmentFilter !== "all") {
      result = result.filter((m) => m.department === departmentFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((m) => m.status === statusFilter);
    }

    return result;
  }, [staffMembers, searchQuery, departmentFilter, statusFilter]);

  const activeCount = staffMembers.filter((m) => m.status === "ACTIVE").length;
  const pendingInviteCount = invitations.filter((i) => i.status === "pending").length;

  // ── Handlers ────────────────────────────────────────────
  const handleEditClick = (member: StaffMemberRecord) => {
    setEditingMember(member);
    setIsProfileModalOpen(true);
  };

  const handleManagePermissions = (member: StaffMemberRecord) => {
    setEditingMember(member);
    setIsProfileModalOpen(true);
  };

  const handleToggleStatus = async (member: StaffMemberRecord) => {
    const newStatus = member.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await toggleStatus({ staffId: member.id, status: newStatus });
      toast.success(`Staff member ${newStatus === "ACTIVE" ? "activated" : "deactivated"} successfully`);
    } catch (err) {
      toast.error("Failed to update staff status");
      console.error(err);
    }
  };

  const handleSaveProfile = async (staffId: string, input: UpdateStaffMemberInput) => {
    try {
      await updateStaff({ staffId, input });
      toast.success("Staff profile updated successfully! ✅");
      setIsProfileModalOpen(false);
      setEditingMember(null);
    } catch (err) {
      toast.error("Failed to update staff profile");
      console.error(err);
    }
  };

  const handleRefreshAll = () => {
    refetchStaff();
    fetchInvitations();
  };

  const handleInviteSuccess = () => {
    fetchInvitations();
    refetchStaff();
  };

  // ── Loading State ──────────────────────────────────────
  if (isStaffLoading && isInvitationsLoading) {
    return <StaffManagementSkeleton />;
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <StaffManagementHeader
        totalMembers={staffMembers.length}
        activeCount={activeCount}
        pendingInvites={pendingInviteCount}
        isLoading={isStaffLoading}
        onInviteClick={() => setIsInviteModalOpen(true)}
        onRefresh={handleRefreshAll}
      />

      {/* Tab Navigation */}
      <div className="flex items-center border-b border-border">
        <button
          onClick={() => setActiveTab("STAFF")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "STAFF"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Staff Roster</span>
          <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-bold">
            {staffMembers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("INVITATIONS")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "INVITATIONS"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <UserPlus className="h-4 w-4" />
          <span>Pending Invitations</span>
          {pendingInviteCount > 0 && (
            <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-amber-500/10 text-amber-600 font-bold">
              {pendingInviteCount}
            </span>
          )}
        </button>
      </div>

      {/* Staff Tab Content */}
      {activeTab === "STAFF" && (
        <div className="space-y-4">
          {/* Filter Toolbar */}
          <StaffFilterToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            departmentFilter={departmentFilter}
            onDepartmentChange={setDepartmentFilter}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
          />

          {/* Desktop Table */}
          <StaffTable
            staffMembers={filteredStaff}
            onEditClick={handleEditClick}
            onToggleStatus={handleToggleStatus}
            onManagePermissions={handleManagePermissions}
          />

          {/* Mobile Cards */}
          <StaffCardGrid
            staffMembers={filteredStaff}
            onEditClick={handleEditClick}
            onToggleStatus={handleToggleStatus}
            onManagePermissions={handleManagePermissions}
          />

          {/* Empty state when filtered results are zero but staff exists */}
          {filteredStaff.length === 0 && staffMembers.length > 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No staff members match your current filters. Try adjusting your search or filters.
            </div>
          )}
        </div>
      )}

      {/* Invitations Tab Content */}
      {activeTab === "INVITATIONS" && (
        <PendingInvitationsTable
          invitations={invitations}
          activeStaff={[]}
          isLoading={isInvitationsLoading}
          onRefresh={fetchInvitations}
        />
      )}

      {/* Profile/Permissions Drawer */}
      <StaffProfileModal
        isOpen={isProfileModalOpen}
        member={editingMember}
        onClose={() => {
          setIsProfileModalOpen(false);
          setEditingMember(null);
        }}
        onSave={handleSaveProfile}
        isSaving={isUpdating}
      />

      {/* Invite Modal */}
      <InviteStaffModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={handleInviteSuccess}
      />
    </div>
  );
}
