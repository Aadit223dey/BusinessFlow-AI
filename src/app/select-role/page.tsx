import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "@/config/env";
import { RoleSelectionCards } from "@/features/auth/components/RoleSelectionCards";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export const dynamic = "force-dynamic";

export default async function SelectRolePage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // Ignore in server component
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Retrieve user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, has_selected_role, has_completed_onboarding")
    .eq("id", user.id)
    .single();

  // If user is SUPER_ADMIN -> /admin-portal
  if (profile?.role === "SUPER_ADMIN") {
    redirect("/admin-portal");
  }

  // If user has already selected a role, redirect to appropriate path
  if (profile?.has_selected_role) {
    if (profile.role === "BUSINESS_OWNER") {
      if (profile.has_completed_onboarding) {
        redirect("/dashboard");
      } else {
        redirect("/onboarding");
      }
    } else if (profile.role === "CUSTOMER") {
      redirect("/customer-portal");
    } else if (profile.role === "STAFF") {
      redirect("/staff-portal");
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-foreground transition-colors duration-300">
      {/* Top Header */}
      <header className="flex h-16 items-center justify-between px-6 sm:px-8 border-b border-border/40 bg-card/30 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-brand-primary to-indigo-600 text-white font-bold text-sm">
            BF
          </div>
          <span className="font-extrabold text-sm tracking-tight">
            BusinessFlow <span className="text-primary">AI</span>
          </span>
        </div>
        <ThemeToggle />
      </header>

      {/* Main Content Canvas */}
      <main className="flex-1 flex items-center justify-center p-6">
        <RoleSelectionCards />
      </main>
    </div>
  );
}
