"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toast";

/**
 * Consolidated App State Orchestrator
 *
 * Synchronizes application layouts by wrapping children inside:
 * 1. QueryClientProvider (TanStack Query) — async state management
 * 2. ThemeProvider (next-themes) — dark/light mode management
 * 3. Toaster (sonner) — toast notification system
 *
 * QueryClient is instantiated inside a useState lazy constructor
 * to prevent query context leaking between server/client renders.
 */

import { AuthProvider } from "@/providers/auth-provider";

export interface GlobalProvidersProps {
  children: ReactNode;
}

export function GlobalProviders({ children }: GlobalProvidersProps) {
  // Lazy state constructor prevents QueryClient re-creation on re-renders
  // and avoids query context leaking between SSR and CSR
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
          mutations: {
            retry: 0,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange={false}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster position="bottom-right" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
