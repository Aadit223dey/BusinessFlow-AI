"use client";

import { StaffMemberRecord } from "@/types/staff";
import { StaffStatusBadge } from "./StaffStatusBadge";
import { MoreHorizontal, User, Edit, Shield, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StaffTableProps {
  staffMembers: StaffMemberRecord[];
  onEditClick: (member: StaffMemberRecord) => void;
  onToggleStatus: (member: StaffMemberRecord) => void;
  onManagePermissions: (member: StaffMemberRecord) => void;
}

export function StaffTable({
  staffMembers,
  onEditClick,
  onToggleStatus,
  onManagePermissions,
}: StaffTableProps) {
  if (!staffMembers || staffMembers.length === 0) {
    return (
      <div className="hidden md:block bg-card text-card-foreground border-border rounded-2xl border p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted/50 mb-4">
          <User className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">No staff members found</h3>
        <p className="text-sm text-muted-foreground mt-1">There are no staff members to display here.</p>
      </div>
    );
  }

  return (
    <div className="hidden md:block rounded-2xl border border-border bg-card text-card-foreground overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground bg-muted/50 uppercase border-b border-border">
            <tr>
              <th className="px-6 py-4 font-medium">Member</th>
              <th className="px-6 py-4 font-medium">Department</th>
              <th className="px-6 py-4 font-medium">Permissions</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Hired</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {staffMembers.map((member) => (
              <tr key={member.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium overflow-hidden shrink-0">
                      {member.profile.avatarUrl ? (
                        <img
                          src={member.profile.avatarUrl}
                          alt="Avatar"
                          className="h-full w-full object-cover"
                        />
                      ) : member.profile.firstName && member.profile.lastName ? (
                        `${member.profile.firstName[0]}${member.profile.lastName[0]}`.toUpperCase()
                      ) : (
                        <User className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-foreground">
                        {member.profile.firstName} {member.profile.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{member.jobTitle}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                    {member.department}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary border border-primary/20">
                    {member.permissions.length} permission{member.permissions.length !== 1 && "s"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StaffStatusBadge status={member.status} size="sm" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                  {new Date(member.hiredAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onEditClick(member)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onManagePermissions(member)}>
                        <Shield className="mr-2 h-4 w-4" /> Manage Permissions
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onToggleStatus(member)}>
                        <Power className="mr-2 h-4 w-4" /> Toggle Status
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
