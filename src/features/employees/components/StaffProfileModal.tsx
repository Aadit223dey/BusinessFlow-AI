"use client";

import { useState, useEffect } from "react";
import {
  StaffMemberRecord,
  UpdateStaffMemberInput,
  DEPARTMENT_OPTIONS,
  EMPLOYMENT_STATUS_OPTIONS,
  StaffPermissionKey,
} from "@/types/staff";
import { X, User, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StaffStatusBadge } from "./StaffStatusBadge";
import { StaffPermissionMatrix } from "./StaffPermissionMatrix";

interface StaffProfileModalProps {
  isOpen: boolean;
  member: StaffMemberRecord | null;
  onClose: () => void;
  onSave: (staffId: string, input: UpdateStaffMemberInput) => Promise<void>;
  isSaving?: boolean;
}

export function StaffProfileModal({
  isOpen,
  member,
  onClose,
  onSave,
  isSaving = false,
}: StaffProfileModalProps) {
  const [jobTitle, setJobTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [status, setStatus] = useState<StaffMemberRecord["status"]>("ACTIVE");
  const [permissions, setPermissions] = useState<StaffPermissionKey[]>([]);

  useEffect(() => {
    if (member) {
      setJobTitle(member.jobTitle || "");
      setDepartment(member.department || "");
      setPhoneNumber(member.phoneNumber || "");
      setStatus(member.status);
      setPermissions(member.permissions || []);
    }
  }, [member]);

  if (!isOpen || !member) return null;

  const handleSave = async () => {
    if (!member) return;
    await onSave(member.id, {
      jobTitle,
      department,
      phoneNumber: phoneNumber || null,
      status,
      permissions,
    });
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-background/80 backdrop-blur-sm transition-opacity"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-xl h-full bg-card border-l border-border shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-border bg-muted/10">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-xl font-bold overflow-hidden border border-primary/20 shrink-0">
              {member.profile.avatarUrl ? (
                <img
                  src={member.profile.avatarUrl}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              ) : member.profile.firstName && member.profile.lastName ? (
                `${member.profile.firstName[0]}${member.profile.lastName[0]}`.toUpperCase()
              ) : (
                <User className="h-7 w-7" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {member.profile.firstName} {member.profile.lastName}
              </h2>
              <p className="text-xs text-muted-foreground">{member.profile.email || "Staff Member"}</p>
              <div className="mt-2">
                <StaffStatusBadge status={status} size="sm" />
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="rounded-full text-muted-foreground hover:text-foreground shrink-0 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Profile Details Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Employment Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <select
                  id="department"
                  className="flex h-10 w-full items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  disabled={isSaving}
                >
                  <option value="" disabled>
                    Select department
                  </option>
                  {DEPARTMENT_OPTIONS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={isSaving}
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Employment Status</Label>
                <select
                  id="status"
                  className="flex h-10 w-full items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  disabled={isSaving}
                >
                  {EMPLOYMENT_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Module Access & Permissions
            </h3>
            <StaffPermissionMatrix
              permissions={permissions}
              onChange={setPermissions}
              disabled={isSaving}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-muted/10 flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Changes
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
