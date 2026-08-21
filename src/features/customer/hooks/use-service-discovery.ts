"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchActiveServices } from "@/services/discovery-service";
import { ServiceDiscoveryItem, ServiceFilterState } from "@/types/discovery";

export function useServiceDiscovery(filters?: Partial<ServiceFilterState>) {
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
    initialData: [],
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
