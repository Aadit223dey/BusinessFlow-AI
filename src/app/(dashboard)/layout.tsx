import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "@/config/env";
import { Sidebar } from "@/components/navigation/Sidebar";
import { TopNav } from "@/components/navigation/TopNav";
import { DashboardLayoutContainer } from "@/components/navigation/DashboardLayoutContainer";

export const dynamic = "force-dynamic";

/**
 * Main Workspace Layout Wrapper Shell (Server Component)
 *
 * Pre-fetches authenticated user profile & active tenant information,
 * verifies session security boundaries, and injects persistent
 * navigation shell controls (Sidebar + TopNav).
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
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
            // Server Component ignore
          }
        },
      },
    }
  );

  // 1. Verify authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // 2. Retrieve user profile & onboarding status
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, role, tenant_id, has_completed_onboarding")
    .eq("id", user.id)
    .single();

  // If user hasn't completed onboarding, redirect to /onboarding
  if (!profile?.has_completed_onboarding) {
    redirect("/onboarding");
  }

  // 3. Retrieve tenant business name
  let tenantName = "My Business Workspace";
  if (profile?.tenant_id) {
    const { data: tenant } = await supabase
      .from("tenants")
      .select("name")
      .eq("id", profile.tenant_id)
      .single();
    if (tenant?.name) {
      tenantName = tenant.name;
    }
  }

  const userName =
    profile?.first_name || profile?.last_name
      ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim()
      : user.email?.split("@")[0] || "Workspace User";

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Sidebar Navigation */}
      <Sidebar tenantName={tenantName} />

      {/* Top Header Navigation */}
      <TopNav
        tenantName={tenantName}
        userName={userName}
        userEmail={user.email}
        userRole={profile?.role || "ADMIN"}
      />

      {/* Dynamic Padding Main Content Canvas Wrapper */}
      <DashboardLayoutContainer>{children}</DashboardLayoutContainer>
    </div>
  );
}
