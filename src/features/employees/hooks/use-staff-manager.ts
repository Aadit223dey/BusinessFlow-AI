"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTenantStaffMembers, updateStaffMember, toggleStaffStatus } from '@/services/staff-management';
import { UpdateStaffMemberInput } from '@/types/staff';
import { useAuth } from '@/providers/auth-provider';

export function useStaffManager() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const tenantId = profile?.tenantId || profile?.tenant_id;

  const staffQuery = useQuery({
    queryKey: ['tenant-staff', tenantId],
    queryFn: fetchTenantStaffMembers,
    enabled: !!tenantId && profile?.role === 'BUSINESS_OWNER',
    staleTime: 1000 * 60 * 3,
    retry: 1,
  });

  const updateMutation = useMutation({
    mutationFn: ({ staffId, input }: { staffId: string; input: UpdateStaffMemberInput }) =>
      updateStaffMember(staffId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-staff'] });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ staffId, status }: { staffId: string; status: 'ACTIVE' | 'INACTIVE' }) =>
      toggleStaffStatus(staffId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-staff'] });
    },
  });

  return {
    staffMembers: staffQuery.data || [],
    isLoading: staffQuery.isLoading,
    isError: staffQuery.isError,
    error: staffQuery.error,
    refetch: staffQuery.refetch,
    updateStaff: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    toggleStatus: toggleStatusMutation.mutateAsync,
    isToggling: toggleStatusMutation.isPending,
  };
}
