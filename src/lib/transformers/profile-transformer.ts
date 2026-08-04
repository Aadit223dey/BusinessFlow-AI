import { ProfileRow, UserProfile } from "@/types";

export function transformProfile(row: ProfileRow | null): UserProfile | null {
  if (!row) return null;

  return {
    ...row,
    // Explicit camelCase mapping alongside snake_case DB fields
    firstName: row.first_name ?? null,
    lastName: row.last_name ?? null,
    hasSelectedRole: row.has_selected_role ?? false,
    hasCompletedOnboarding: row.has_completed_onboarding ?? false,
    tenantId: row.tenant_id ?? null,
    avatarUrl: row.avatar_url ?? null,
  };
}
