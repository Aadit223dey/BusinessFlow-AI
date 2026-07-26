"use client";

import { useState } from "react";
import { Mail, Clock, CheckCircle2, AlertTriangle, Trash2, Shield, User, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { type Invitation, type UserProfile } from "@/types";

interface PendingInvitationsTableProps {
  invitations: Invitation[];
  activeStaff: UserProfile[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function PendingInvitationsTable({
  invitations,
  activeStaff,
  isLoading,
  onRefresh,
}: PendingInvitationsTableProps) {
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "PENDING">("PENDING");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const formatDaysRemaining = (expiresAt: string) => {
    const diffMs = new Date(expiresAt).getTime() - Date.now();
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (days <= 0) return "Expired";
    if (days === 1) return "1 day remaining";
    return `${days} days remaining`;
  };

  const handleCancel = async (id: string) => {
    setActionLoadingId(id);
    try {
      toast.success("Invitation cancelled successfully");
      onRefresh();
    } catch {
      toast.error("Failed to cancel invitation");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCopyLink = (invitationToken: string) => {
    const url = `${window.location.origin}/invite/accept?token=${invitationToken}`;
    navigator.clipboard.writeText(url);
    toast.success("Invite URL copied to clipboard! 📋", {
      description: url,
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Tabs */}
      <div className="flex items-center border-b border-border">
        <button
          onClick={() => setActiveTab("PENDING")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "PENDING"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Pending Invitations</span>
          <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-bold">
            {invitations.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("ACTIVE")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "ACTIVE"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          <span>Active Staff</span>
          <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-success/10 text-success font-bold">
            {activeStaff.length}
          </span>
        </button>
      </div>

      {/* Content */}
      {activeTab === "PENDING" ? (
        <div className="border border-border bg-card rounded-2xl overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Loading invitations...</div>
          ) : invitations.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-muted text-muted-foreground">
                <Mail className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-foreground">No Pending Invitations</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Invited employees will appear here until they accept their invitation and complete onboarding.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                  <tr>
                    <th className="px-6 py-3.5">Email Address</th>
                    <th className="px-6 py-3.5">Invited Role</th>
                    <th className="px-6 py-3.5">Sent Date</th>
                    <th className="px-6 py-3.5">Expires In</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {invitations.map((invite) => {
                    const isExpired = new Date(invite.expires_at).getTime() <= Date.now() || invite.status === "expired";
                    const isCancelled = invite.status === "cancelled";
                    return (
                      <tr key={invite.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-medium text-foreground">{invite.email}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                            <Shield className="h-3 w-3" />
                            {invite.invited_role || "STAFF"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {new Date(invite.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {formatDaysRemaining(invite.expires_at)}
                        </td>
                        <td className="px-6 py-4">
                          {isCancelled ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border">
                              <XCircle className="h-3 w-3" />
                              Cancelled
                            </span>
                          ) : isExpired ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-destructive/10 text-destructive border border-destructive/20">
                              <AlertTriangle className="h-3 w-3" />
                              Expired
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-warning/10 text-warning border border-warning/20">
                              <Clock className="h-3 w-3" />
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          {!isCancelled && !isExpired && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCopyLink(invite.invitation_token)}
                              className="text-xs"
                            >
                              Copy Link
                            </Button>
                          )}
                          {!isCancelled && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancel(invite.id)}
                              disabled={actionLoadingId === invite.id}
                              className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="border border-border bg-card rounded-2xl overflow-hidden shadow-sm">
          {activeStaff.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-muted text-muted-foreground">
                <User className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-foreground">No Active Staff Members</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Once invited staff members accept their invitations, they will be listed here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                  <tr>
                    <th className="px-6 py-3.5">Name</th>
                    <th className="px-6 py-3.5">Role</th>
                    <th className="px-6 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {activeStaff.map((staff) => (
                    <tr key={staff.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">
                        {staff.first_name ? `${staff.first_name} ${staff.last_name || ""}` : "Staff Member"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                          <Shield className="h-3 w-3" />
                          STAFF
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-success/10 text-success border border-success/20">
                          <CheckCircle2 className="h-3 w-3" />
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
