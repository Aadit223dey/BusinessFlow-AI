"use client";

import { StaffPermissionKey, PERMISSION_GROUPS } from '@/types/staff';
import { Button } from '@/components/ui/button';
import { Shield, Check } from 'lucide-react';

interface StaffPermissionMatrixProps {
  permissions: StaffPermissionKey[];
  onChange: (updated: StaffPermissionKey[]) => void;
  disabled?: boolean;
}

export function StaffPermissionMatrix({ permissions, onChange, disabled = false }: StaffPermissionMatrixProps) {
  const togglePermission = (key: StaffPermissionKey, checked: boolean) => {
    if (disabled) return;
    if (checked) {
      if (!permissions.includes(key)) {
        onChange([...permissions, key]);
      }
    } else {
      onChange(permissions.filter((p) => p !== key));
    }
  };

  const grantAll = (groupKeys: StaffPermissionKey[]) => {
    if (disabled) return;
    const newPerms = new Set([...permissions, ...groupKeys]);
    onChange(Array.from(newPerms));
  };

  const revokeAll = (groupKeys: StaffPermissionKey[]) => {
    if (disabled) return;
    const newPerms = permissions.filter(p => !groupKeys.includes(p));
    onChange(newPerms);
  };

  return (
    <div className="space-y-4">
      {PERMISSION_GROUPS.map((group) => {
        const groupKeys = group.permissions.map(p => p.key);
        const activeCount = groupKeys.filter(k => permissions.includes(k)).length;
        const allActive = activeCount === groupKeys.length && groupKeys.length > 0;

        return (
          <div key={group.module} className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/30 border-b border-border gap-3">
              <div>
                <h4 className="font-medium text-foreground text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  {group.module}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">{group.description}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => grantAll(groupKeys)}
                  disabled={disabled || allActive}
                  className="text-xs h-7"
                >
                  Grant All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => revokeAll(groupKeys)}
                  disabled={disabled || activeCount === 0}
                  className="text-xs h-7"
                >
                  Revoke All
                </Button>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {group.permissions.map(permission => {
                const isChecked = permissions.includes(permission.key);
                return (
                  <label
                    key={permission.key}
                    className={`flex items-start gap-3 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="mt-0.5">
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={isChecked}
                        disabled={disabled}
                        onClick={() => togglePermission(permission.key, !isChecked)}
                        className={`flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all ${
                          isChecked
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'border-border bg-background hover:border-primary/50'
                        } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        {isChecked && <Check className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-foreground">
                        {permission.label}
                      </span>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {permission.description}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
