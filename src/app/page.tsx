import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "@/config/env";
import { SUPER_ADMIN_EMAIL } from "@/config/admin";
import { handleAsyncOperation } from "@/services/base-api";

export const dynamic = "force-dynamic";

/**
 * Authoritative Root Route (/) System Entry-Point Director
 *
 * Evaluates active user sessions, checks email against SUPER_ADMIN_EMAIL,
 * evaluates role selection (has_selected_role) and onboarding status
 * (has_completed_onboarding) to route traffic instantly across all 4 portals.
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

  // Retrieve user session
  const { data: sessionData } = await handleAsyncOperation(async () => {
    const { data, error } = await supabaseServer.auth.getUser();
    if (error) throw error;
    return data;
  });

  const user = sessionData?.user;

  if (!user) {
    redirect("/login");
  }

  // Super Admin Check
  const isSuperAdminEmail =
    user.email && user.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

  if (isSuperAdminEmail) {
    redirect("/admin-portal");
  }

  // Retrieve profile data
  const { data: profile } = await handleAsyncOperation(async () => {
    const { data, error } = await supabaseServer
      .from("profiles")
      .select("role, has_selected_role, has_completed_onboarding")
      .eq("id", user.id)
      .single();
    if (error) throw error;
    return data;
  });

  if (profile?.role === "SUPER_ADMIN") {
    redirect("/admin-portal");
  }

  if (!profile?.has_selected_role) {
    redirect("/select-role");
  }

  if (profile.role === "BUSINESS_OWNER") {
    if (profile.has_completed_onboarding) {
      redirect("/dashboard");
    } else {
      redirect("/onboarding");
    }
  }

  if (profile.role === "CUSTOMER") {
    redirect("/customer-portal");
  }

  if (profile.role === "STAFF") {
    redirect("/staff-portal");
  }

  redirect("/select-role");
}
