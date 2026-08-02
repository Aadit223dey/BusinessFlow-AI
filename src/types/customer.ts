export interface CustomerProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email?: string;
  phone: string | null;
  avatar_url: string | null;
  address: string | null;
  date_of_birth: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  role: 'CUSTOMER';
  tenant_id: string | null;
  has_selected_role: boolean;
  has_completed_onboarding: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerDashboardStats {
  upcomingBookings: number;
  completedServices: number;
  connectedBusinesses: number;
  activeInvoices: number;
}

export interface CustomerActivity {
  id: string;
  type: 'profile_update' | 'service_completed' | 'booking_created' | 'invoice_paid' | 'account_created';
  title: string;
  description: string;
  timestamp: string;
}

export interface ConnectedBusiness {
  id: string;
  name: string;
  category?: string;
  logoUrl?: string;
  lastVisit?: string;
}
