import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { RoleSelectionCards } from "@/features/auth/components/RoleSelectionCards";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export const dynamic = "force-dynamic";

export default async function SelectRolePage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user || !user.email) {
    console.log("🔍 [DIAGNOSTIC] AUTH_USER_DETECTED: False -> Redirecting to /login");
    redirect("/login");
  }

  const userEmail = user.email.toLowerCase().trim();
  console.log("🔍 [DIAGNOSTIC] AUTH_USER_DETECTED: True", { userId: user.id, email: userEmail });

  // 1. Check existing profile state
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role, has_selected_role, has_completed_onboarding, tenant_id")
    .eq("id", user.id)
    .single();

  if (profile?.role === "STAFF") {
    console.log(
      "🔍 [DIAGNOSTIC] STAFF_FLOW_TRIGGERED: User already has STAFF role -> Redirecting to /staff-portal"
    );
    redirect("/staff-portal");
  } else if (profile?.role === "BUSINESS_OWNER") {
    redirect(profile.has_completed_onboarding ? "/dashboard" : "/onboarding");
  } else if (profile?.role === "CUSTOMER") {
    redirect("/customer-portal");
  } else if (profile?.role === "SUPER_ADMIN") {
    redirect("/admin-portal");
  }

  // 2. Pending Staff Invitation Check (Guarantees reconciliation if trigger did not execute)
  console.log("🔍 [DIAGNOSTIC] PENDING_INVITATION_LOOKUP", { email: userEmail });

  const { data: invite } = await supabaseAdmin
    .from("invitations")
    .select("id, tenant_id, invited_role, status, expires_at")
    .eq("email", userEmail)
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (invite) {
    console.log("🔍 [DIAGNOSTIC] INVITATION_FOUND & VALIDATED", {
      inviteId: invite.id,
      tenantId: invite.tenant_id,
    });

    // A. Update Profile
    await supabaseAdmin
      .from("profiles")
      .update({
        role: "STAFF",
        tenant_id: invite.tenant_id,
        has_selected_role: true,
        has_completed_onboarding: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    // B. Upsert Staff Member
    const { data: staffMember } = await supabaseAdmin
      .from("staff_members")
      .upsert(
        {
          profile_id: user.id,
          tenant_id: invite.tenant_id,
          job_title: "Staff Member",
          department: "General",
          status: "ACTIVE",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "profile_id" }
      )
      .select("id")
      .single();

    // C. Assign Default Permissions
    if (staffMember) {
      const defaultPerms = ["SERVICES_VIEW", "APPOINTMENTS_VIEW", "CUSTOMERS_VIEW"];
      await supabaseAdmin.from("staff_permissions").upsert(
        defaultPerms.map((p) => ({
          staff_id: staffMember.id,
          tenant_id: invite.tenant_id,
          permission_key: p,
        })),
        { onConflict: "staff_id,permission_key" }
      );
    }

    // D. Mark Invitation Accepted
    await supabaseAdmin
      .from("invitations")
      .update({
        status: "accepted",
        accepted_at: new Date().toISOString(),
        auth_user_id: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", invite.id);

    console.log(
      "🔍 [DIAGNOSTIC] STAFF_ROLE_ASSIGNED & INVITATION_ACCEPTED -> Redirecting to /staff-portal"
    );
    redirect("/staff-portal");
  }

  // 3. Fallback to Public Role Selection ONLY if no invitation exists
  console.log("🔍 [DIAGNOSTIC] PUBLIC_ROLE_SELECTION_TRIGGERED");
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
