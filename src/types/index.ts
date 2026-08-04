export type UserRole = "SUPER_ADMIN" | "BUSINESS_OWNER" | "STAFF" | "CUSTOMER";

// Database Row Schema (Matching PostgreSQL public.profiles exactly)
export interface ProfileRow {
  id: string;
  tenant_id: string | null;
  role: UserRole | null;
  first_name: string | null;
  last_name: string | null;
  has_selected_role: boolean;
  has_completed_onboarding: boolean;
  phone?: string | null;
  avatar_url?: string | null;
  address?: string | null;
  date_of_birth?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Normalized Application Interface used across React Context and UI
export interface UserProfile extends ProfileRow {
  // Alias getters / mapped properties to guarantee compatibility with both conventions
  firstName?: string | null;
  lastName?: string | null;
  hasSelectedRole?: boolean;
  hasCompletedOnboarding?: boolean;
  tenantId?: string | null;
  avatarUrl?: string | null;
}

export type InvitationStatus = "pending" | "accepted" | "expired" | "cancelled";

export interface Invitation {
  id: string;
  tenant_id: string;
  invited_by: string;
  email: string;
  invited_role: "STAFF" | "BUSINESS_OWNER" | "CUSTOMER";
  invitation_token: string;
  status: InvitationStatus;
  created_at: string;
  updated_at: string;
  expires_at: string;
  accepted_at: string | null;
  tenant_name?: string;
  inviter_name?: string;
}

export interface CreateInvitationInput {
  email: string;
  invited_role?: "STAFF";
}
