import { supabase } from '@/lib/supabase';
import { StaffMemberRecord, UpdateStaffMemberInput, StaffPermissionKey } from '@/types/staff';

/**
 * Fetch all staff members belonging to the current user's tenant.
 * RLS automatically scopes results to the authenticated Business Owner's tenant.
 */
export async function fetchTenantStaffMembers(): Promise<StaffMemberRecord[]> {
  const { data, error } = await supabase
    .from('staff_members')
    .select(`
      id,
      profile_id,
      tenant_id,
      job_title,
      department,
      phone_number,
      status,
      hired_at,
      created_at,
      updated_at,
      profile:profiles (id, first_name, last_name, avatar_url),
      permissions:staff_permissions (permission_key)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ [Staff Service] Fetch Error:', error.message);
    throw new Error(error.message);
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    profileId: row.profile_id,
    tenantId: row.tenant_id,
    jobTitle: row.job_title,
    department: row.department,
    phoneNumber: row.phone_number,
    status: row.status,
    hiredAt: row.hired_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    profile: {
      id: row.profile?.id ?? row.profile_id,
      firstName: row.profile?.first_name ?? null,
      lastName: row.profile?.last_name ?? null,
      email: '', // Email is retrieved via auth context, not exposed on profiles table
      avatarUrl: row.profile?.avatar_url ?? null,
    },
    permissions: (row.permissions || []).map((p: any) => p.permission_key as StaffPermissionKey),
  }));
}

/**
 * Update a staff member's core details and optionally sync permissions.
 */
export async function updateStaffMember(staffId: string, input: UpdateStaffMemberInput): Promise<void> {
  const { status, jobTitle, department, phoneNumber, permissions } = input;

  // 1. Build update payload (only include defined fields)
  const updatePayload: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };
  if (jobTitle !== undefined) updatePayload.job_title = jobTitle;
  if (department !== undefined) updatePayload.department = department;
  if (phoneNumber !== undefined) updatePayload.phone_number = phoneNumber;
  if (status !== undefined) updatePayload.status = status;

  const { error: staffError } = await supabase
    .from('staff_members')
    .update(updatePayload)
    .eq('id', staffId);

  if (staffError) throw new Error(staffError.message);

  // 2. Sync permissions if supplied
  if (permissions !== undefined) {
    // Delete existing permissions for this staff member
    const { error: delError } = await supabase
      .from('staff_permissions')
      .delete()
      .eq('staff_id', staffId);

    if (delError) throw new Error(delError.message);

    // Insert new permissions
    if (permissions.length > 0) {
      // Fetch tenant_id from the staff member record
      const { data: staffRecord } = await supabase
        .from('staff_members')
        .select('tenant_id')
        .eq('id', staffId)
        .single();

      const tenantId = staffRecord?.tenant_id;
      if (!tenantId) throw new Error('Could not resolve tenant_id for staff member');

      const permRows = permissions.map((key) => ({
        staff_id: staffId,
        tenant_id: tenantId,
        permission_key: key,
      }));

      const { error: insError } = await supabase.from('staff_permissions').insert(permRows);
      if (insError) throw new Error(insError.message);
    }
  }
}

/**
 * Toggle a staff member's active/inactive status.
 */
export async function toggleStaffStatus(staffId: string, status: 'ACTIVE' | 'INACTIVE'): Promise<void> {
  const { error } = await supabase
    .from('staff_members')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', staffId);

  if (error) throw new Error(error.message);
}
