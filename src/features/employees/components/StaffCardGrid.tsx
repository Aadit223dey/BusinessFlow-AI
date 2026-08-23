"use client";

import { StaffMemberRecord } from "@/types/staff";
import { StaffStatusBadge } from "./StaffStatusBadge";
import { User, Edit, Shield, Power } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StaffCardGridProps {
  staffMembers: StaffMemberRecord[];
  onEditClick: (member: StaffMemberRecord) => void;
  onToggleStatus: (member: StaffMemberRecord) => void;
  onManagePermissions: (member: StaffMemberRecord) => void;
}

export function StaffCardGrid({
  staffMembers,
  onEditClick,
  onToggleStatus,
  onManagePermissions,
}: StaffCardGridProps) {
  if (!staffMembers || staffMembers.length === 0) {
    return (
      <div className="md:hidden bg-card text-card-foreground border-border rounded-xl border p-6 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted/50 mb-3">
          <User className="h-5 w-5 text-muted-foreground" />
        </div>
        <h3 className="text-base font-medium">No staff members</h3>
      </div>
    );
  }

  return (
    <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
      {staffMembers.map((member) => (
        <div
          key={member.id}
          className="rounded-xl border border-border bg-card text-card-foreground p-5 flex flex-col gap-4 shadow-sm"
        >
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium overflow-hidden shrink-0">
                {member.profile.avatarUrl ? (
                  <img
                    src={member.profile.avatarUrl}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                ) : member.profile.firstName && member.profile.lastName ? (
                  `${member.profile.firstName[0]}${member.profile.lastName[0]}`.toUpperCase()
                ) : (
                  <User className="h-6 w-6" />
                )}
              </div>
              <div>
                <div className="font-medium text-foreground">
                  {member.profile.firstName} {member.profile.lastName}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{member.jobTitle}</div>
              </div>
            </div>
            <StaffStatusBadge status={member.status} size="sm" />
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 font-medium text-secondary-foreground">
              {member.department}
            </span>
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 font-medium text-primary border border-primary/20">
              {member.permissions.length} permission{member.permissions.length !== 1 && "s"}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-2 pt-4 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => onEditClick(member)}
            >
              <Edit className="h-3.5 w-3.5 mr-1.5" /> Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => onManagePermissions(member)}
            >
              <Shield className="h-3.5 w-3.5 mr-1.5" /> Perms
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => onToggleStatus(member)}
            >
              <Power className="h-3.5 w-3.5 mr-1.5" /> Status
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
