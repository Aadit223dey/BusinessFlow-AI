"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchOwnerServices,
  fetchOwnerCategories,
  createService,
  updateService,
  toggleServiceStatus,
  deleteService,
} from "@/services/service-management";
import { ServiceFilterParams } from "@/types/service";
import { ServiceFormValues } from "@/features/services/schemas/service-schema";
import { useAuth } from "@/providers/auth-provider";

export function useServicesManager(filters?: ServiceFilterParams) {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const tenantId = profile?.tenantId || profile?.tenant_id;

  const servicesQuery = useQuery({
    queryKey: [
      "owner-services",
      tenantId,
      filters?.search ?? "",
      filters?.categoryId ?? "all",
      filters?.status ?? "all",
    ],
    queryFn: () => fetchOwnerServices(filters),
    enabled: !!tenantId,
    initialData: [],
    staleTime: 1000 * 60 * 3, // 3 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const categoriesQuery = useQuery({
    queryKey: ["owner-categories", tenantId],
    queryFn: () => fetchOwnerCategories(),
    enabled: !!tenantId,
    initialData: [],
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const createMutation = useMutation({
    mutationFn: (values: ServiceFormValues) => {
      if (!tenantId) throw new Error("Tenant context missing");
      return createService(values, tenantId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-services"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<ServiceFormValues> }) =>
      updateService(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-services"] });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleServiceStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-services"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-services"] });
    },
  });

  return {
    services: servicesQuery.data || [],
    categories: categoriesQuery.data || [],
    isLoading: servicesQuery.isLoading,
    isError: servicesQuery.isError,
    error: servicesQuery.error,
    createService: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateService: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    toggleStatus: toggleStatusMutation.mutateAsync,
    isToggling: toggleStatusMutation.isPending,
    deleteService: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
