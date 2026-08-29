import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { SUPER_ADMIN_EMAIL } from "@/config/admin";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const isSuperAdminEmail =
    user.email && user.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

  if (isSuperAdminEmail) {
    redirect("/admin-portal");
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role, has_selected_role, has_completed_onboarding")
    .eq("id", user.id)
    .single();

  if (profile?.role === "STAFF") {
    redirect("/staff-portal");
  } else if (profile?.role === "BUSINESS_OWNER") {
    redirect(profile.has_completed_onboarding ? "/dashboard" : "/onboarding");
  } else if (profile?.role === "CUSTOMER") {
    redirect("/customer-portal");
  } else if (profile?.role === "SUPER_ADMIN") {
    redirect("/admin-portal");
  } else {
    redirect("/select-role");
  }
}
