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
