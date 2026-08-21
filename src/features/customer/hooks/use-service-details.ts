"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchServiceDetails } from "@/services/discovery-service";
import { ServiceDiscoveryItem } from "@/types/discovery";

export function useServiceDetails(serviceId: string) {
  return useQuery<ServiceDiscoveryItem | null>({
    queryKey: ["customer", "service-details", serviceId],
    queryFn: async () => {
      if (!serviceId) return null;
      return await fetchServiceDetails(serviceId);
    },
    enabled: !!serviceId,
    initialData: null,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
