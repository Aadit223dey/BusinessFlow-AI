// ========================================================
// Sprint 6: Staff Management Type Contracts
// ========================================================

// ── Permission Keys ────────────────────────────────────────
export const STAFF_PERMISSIONS = {
  // Services
  SERVICES_VIEW: 'SERVICES_VIEW',
  SERVICES_MANAGE: 'SERVICES_MANAGE',

  // Customers
  CUSTOMERS_VIEW: 'CUSTOMERS_VIEW',
  CUSTOMERS_MANAGE: 'CUSTOMERS_MANAGE',

  // Appointments / Calendar
  APPOINTMENTS_VIEW: 'APPOINTMENTS_VIEW',
  APPOINTMENTS_MANAGE: 'APPOINTMENTS_MANAGE',

  // Staff / Team
  STAFF_VIEW: 'STAFF_VIEW',
  STAFF_MANAGE: 'STAFF_MANAGE',

  // Reporting
  REPORTS_VIEW: 'REPORTS_VIEW',
} as const;

export type StaffPermissionKey = (typeof STAFF_PERMISSIONS)[keyof typeof STAFF_PERMISSIONS];

export interface PermissionGroupDefinition {
  module: string;
  description: string;
  permissions: {
    key: StaffPermissionKey;
    label: string;
    description: string;
  }[];
}

/** Canonical permission groups for UI rendering */
export const PERMISSION_GROUPS: PermissionGroupDefinition[] = [
  {
    module: 'Services',
    description: 'Access to service catalog and management',
    permissions: [
      { key: 'SERVICES_VIEW', label: 'View Services', description: 'View service listings and details' },
      { key: 'SERVICES_MANAGE', label: 'Manage Services', description: 'Create, edit, and delete services' },
    ],
  },
  {
    module: 'Customers',
    description: 'Access to customer records and profiles',
    permissions: [
      { key: 'CUSTOMERS_VIEW', label: 'View Customers', description: 'View customer profiles and history' },
      { key: 'CUSTOMERS_MANAGE', label: 'Manage Customers', description: 'Edit customer records and notes' },
    ],
  },
  {
    module: 'Appointments',
    description: 'Access to scheduling and calendar',
    permissions: [
      { key: 'APPOINTMENTS_VIEW', label: 'View Appointments', description: 'View scheduled appointments' },
      { key: 'APPOINTMENTS_MANAGE', label: 'Manage Appointments', description: 'Create, reschedule, and cancel appointments' },
    ],
  },
  {
    module: 'Team',
    description: 'Access to staff directory and team info',
    permissions: [
      { key: 'STAFF_VIEW', label: 'View Team', description: 'View team member profiles' },
      { key: 'STAFF_MANAGE', label: 'Manage Team', description: 'Edit team member details' },
    ],
  },
  {
    module: 'Reports',
    description: 'Access to analytics and reporting',
    permissions: [
      { key: 'REPORTS_VIEW', label: 'View Reports', description: 'View business analytics and reports' },
    ],
  },
];

/** Default permissions granted on invitation acceptance */
export const DEFAULT_STAFF_PERMISSIONS: StaffPermissionKey[] = [
  'SERVICES_VIEW',
  'APPOINTMENTS_VIEW',
  'CUSTOMERS_VIEW',
];

// ── Employment Status ──────────────────────────────────────
export type EmploymentStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'SUSPENDED';

// ── Staff Member Record ────────────────────────────────────
export interface StaffMemberRecord {
  id: string;
  profileId: string;
  tenantId: string;
  jobTitle: string;
  department: string;
  phoneNumber: string | null;
  status: EmploymentStatus;
  hiredAt: string;
  createdAt: string;
  updatedAt: string;
  profile: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    avatarUrl: string | null;
  };
  permissions: StaffPermissionKey[];
}

// ── Mutation Inputs ────────────────────────────────────────
export interface UpdateStaffMemberInput {
  jobTitle?: string;
  department?: string;
  phoneNumber?: string | null;
  status?: EmploymentStatus;
  permissions?: StaffPermissionKey[];
}

// ── Department Options ─────────────────────────────────────
export const DEPARTMENT_OPTIONS = [
  'General',
  'Sales',
  'Operations',
  'Customer Support',
  'Marketing',
  'Finance',
  'Human Resources',
  'Technical',
  'Management',
] as const;

export const EMPLOYMENT_STATUS_OPTIONS: { value: EmploymentStatus; label: string; color: string }[] = [
  { value: 'ACTIVE', label: 'Active', color: 'emerald' },
  { value: 'INACTIVE', label: 'Inactive', color: 'gray' },
  { value: 'ON_LEAVE', label: 'On Leave', color: 'amber' },
  { value: 'SUSPENDED', label: 'Suspended', color: 'red' },
];
