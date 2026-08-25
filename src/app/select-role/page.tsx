import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
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

  const admin = getSupabaseAdmin();
  const dbClient = admin || supabase;

  // 1. Fetch current profile state
  const { data: profile } = await dbClient
    .from("profiles")
    .select("role, has_selected_role, has_completed_onboarding, tenant_id")
    .eq("id", user.id)
    .single();

  // If already STAFF, redirect to staff portal
  if (profile?.role === "STAFF") {
    console.log("🔍 [DIAGNOSTIC] PUBLIC_ROLE_SELECTION_BYPASSED: User already has STAFF role");
    redirect("/staff-portal");
  } else if (profile?.role === "BUSINESS_OWNER") {
    redirect(profile.has_completed_onboarding ? "/dashboard" : "/onboarding");
  } else if (profile?.role === "CUSTOMER") {
    redirect("/customer-portal");
  } else if (profile?.role === "SUPER_ADMIN") {
    redirect("/admin-portal");
  }

  // 2. Lookup Pending Staff Invitation for this verified email
  console.log("🔍 [DIAGNOSTIC] INVITATION_LOOKUP_STARTED", { email: userEmail });

  const { data: invite } = await dbClient
    .from("invitations")
    .select("id, tenant_id, invited_role, status, expires_at")
    .eq("email", userEmail)
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (invite) {
    console.log("🔍 [DIAGNOSTIC] INVITATION_FOUND & INVITATION_VALID", {
      inviteId: invite.id,
      tenantId: invite.tenant_id,
      role: invite.invited_role,
    });

    console.log("🔍 [DIAGNOSTIC] STAFF_ROLE_ASSIGNMENT_STARTED");

    // A. Update Profile to STAFF
    const { error: profileUpdateError } = await dbClient
      .from("profiles")
      .update({
        role: "STAFF",
        tenant_id: invite.tenant_id,
        has_selected_role: true,
        has_completed_onboarding: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (profileUpdateError) {
      console.error("❌ [DIAGNOSTIC] Failed to update profile to STAFF:", profileUpdateError);
      redirect("/login?error=ProfileBindingFailed");
    }

    // B. Upsert Staff Member Record
    const { data: staffMember } = await dbClient
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

    if (staffMember) {
      // C. Assign Baseline Permissions
      const defaultPerms = ["SERVICES_VIEW", "APPOINTMENTS_VIEW", "CUSTOMERS_VIEW"];
      await dbClient.from("staff_permissions").upsert(
        defaultPerms.map((p) => ({
          staff_id: staffMember.id,
          tenant_id: invite.tenant_id,
          permission_key: p,
        })),
        { onConflict: "staff_id,permission_key" }
      );
    }

    // D. Mark Invitation Accepted
    await dbClient
      .from("invitations")
      .update({
        status: "accepted",
        accepted_at: new Date().toISOString(),
        auth_user_id: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", invite.id);

    console.log("🔍 [DIAGNOSTIC] INVITATION_ACCEPTED & STAFF_REDIRECT_STARTED");
    redirect("/staff-portal");
  }

  // 3. No Invitation -> Fallback to Public Registration Selection
  console.log("🔍 [DIAGNOSTIC] INVITATION_NOT_FOUND -> PUBLIC_ROLE_SELECTION_TRIGGERED");
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
