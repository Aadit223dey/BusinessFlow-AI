"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchActiveServices } from "@/services/discovery-service";
import { ServiceDiscoveryItem, ServiceFilterState } from "@/types/discovery";
import { useAuth } from "@/providers/auth-provider";

export function useServiceDiscovery(filters?: Partial<ServiceFilterState>) {
  const { user } = useAuth();

  return useQuery<ServiceDiscoveryItem[]>({
    queryKey: [
      "customer",
      "services",
      filters?.searchQuery ?? "",
      filters?.categoryId ?? "all",
      filters?.tenantId ?? "all",
      filters?.maxPrice ?? "all",
      filters?.maxDuration ?? "all",
      filters?.sortBy ?? "default",
    ],
    queryFn: async () => {
      return await fetchActiveServices(filters);
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 3, // 3 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
