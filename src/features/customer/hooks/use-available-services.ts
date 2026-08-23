"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAvailableCustomerServices } from "@/services/discovery-service";
import { useAuth } from "@/providers/auth-provider";

export function useAvailableServices() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["customer", "available-services"],
    queryFn: fetchAvailableCustomerServices,
    enabled: !!user, // Available for any authenticated customer regardless of tenant_id
    staleTime: 1000 * 60 * 3, // 3 minutes
    retry: 1,
  });
}
