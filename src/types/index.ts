export type UserRole = "SUPER_ADMIN" | "BUSINESS_OWNER" | "STAFF" | "CUSTOMER";

export interface UserProfile {
  id: string;
  role: UserRole | null;
  has_selected_role: boolean;
  has_completed_onboarding: boolean;
  first_name?: string | null;
  last_name?: string | null;
  tenant_id?: string | null;
  created_at?: string;
  updated_at?: string;
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
