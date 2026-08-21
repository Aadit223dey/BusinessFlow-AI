"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchServiceCategories } from "@/services/discovery-service";
import { ServiceCategory } from "@/types/discovery";

export function useServiceCategories() {
  return useQuery<ServiceCategory[]>({
    queryKey: ["customer", "service-categories"],
    queryFn: async () => {
      return await fetchServiceCategories();
    },
    initialData: [],
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
