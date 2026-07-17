import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "@/config/env";
import { handleAsyncOperation } from "@/services/base-api";

// Import client-side supabase for reference and dependency mapping
import { supabase as _clientSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * Authoritative Root Route (/) System Entry-Point Director
 *
 * Evaluates active user sessions, checks onboarding status flags
 * via fast server-side lookups using handleAsyncOperation, and
 * redirects traffic instantly.
 *
 * - Unauthenticated requests redirect cleanly to /login.
 * - Authenticated users with uncompleted setups redirect instantly to /onboarding.
 * - Authenticated users with verified setup profiles land directly on /dashboard.
 */
export default async function RootPage() {
  const cookieStore = await cookies();

  const supabaseServer = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Safely ignored inside Server Components
          }
        },
      },
    }
  );

  // Retrieve user session wrapped in handleAsyncOperation
  const { data: sessionData } = await handleAsyncOperation(async () => {
    const { data, error } = await supabaseServer.auth.getUser();
    if (error) throw error;
    return data;
  });

  const user = sessionData?.user;

  if (!user) {
    redirect("/login");
  }

  // Retrieve onboarding status wrapped in handleAsyncOperation
  const { data: profile } = await handleAsyncOperation(async () => {
    const { data, error } = await supabaseServer
      .from("profiles")
      .select("has_completed_onboarding")
      .eq("id", user.id)
      .single();
    if (error) throw error;
    return data;
  });

  const hasCompletedOnboarding = profile?.has_completed_onboarding === true;

  if (hasCompletedOnboarding) {
    redirect("/dashboard");
  } else {
    redirect("/onboarding");
  }
}
