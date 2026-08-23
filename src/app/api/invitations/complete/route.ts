import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = await req.json();
    const { password, firstName, lastName, token } = body;

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin() || supabase;

    // ── 1. Locate Pending Invitation ────────────────────────────────
    let invite: any = null;
    let userId: string | null = user?.id || null;

    if (user?.email) {
      const normalizedEmail = user.email.trim().toLowerCase();
      const { data: invData, error: inviteError } = await admin
        .from("invitations")
        .select("*")
        .eq("email", normalizedEmail)
        .eq("status", "pending")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!inviteError && invData) {
        invite = invData;
      }
    }

    // Fallback: If token was passed directly (from URL query string)
    if (!invite && token) {
      const { data: invData, error: inviteError } = await admin
        .from("invitations")
        .select("*")
        .eq("invitation_token", token)
        .eq("status", "pending")
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();

      if (!inviteError && invData) {
        invite = invData;
      }
    }

    if (!invite) {
      return NextResponse.json(
        { error: "Invitation is invalid, expired, or has already been used." },
        { status: 400 }
      );
    }

    // ── 2. Update Password or Register User ──────────────────────────
    if (user) {
      // User is logged in via Supabase invite email magic link
      const { error: passwordError } = await supabase.auth.updateUser({ password });
      if (passwordError) {
        return NextResponse.json({ error: passwordError.message }, { status: 422 });
      }
    } else {
      // User is signing up using token without prior session
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: invite.email,
        password,
        options: {
          data: {
            first_name: firstName?.trim() || "",
            last_name: lastName?.trim() || "",
            role: "STAFF",
            tenant_id: invite.tenant_id,
          },
        },
      });

      if (signUpError) {
        return NextResponse.json({ error: signUpError.message }, { status: 422 });
      }

      userId = signUpData.user?.id || null;
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Failed to resolve user account for invitation." },
        { status: 400 }
      );
    }

    // ── 3. Update public.profiles ────────────────────────────────────
    const { error: profileError } = await admin
      .from("profiles")
      .upsert({
        id: userId,
        first_name: firstName?.trim() || null,
        last_name: lastName?.trim() || null,
        role: "STAFF",
        tenant_id: invite.tenant_id,
        has_selected_role: true,
        has_completed_onboarding: true,
        updated_at: new Date().toISOString(),
      });

    if (profileError) {
      console.error("❌ [Profile Update Failed]:", profileError);
      return NextResponse.json({ error: "Failed to update user profile" }, { status: 500 });
    }

    // ── 4. Upsert public.staff_members Record ────────────────────────
    const { data: staffMember, error: staffError } = await admin
      .from("staff_members")
      .upsert(
        {
          profile_id: userId,
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

    if (staffError) {
      console.error("❌ [Staff Record Creation Failed]:", staffError);
    }

    // ── 5. Grant Baseline Staff Permissions ──────────────────────────
    if (staffMember?.id) {
      const baselinePermissions = ["SERVICES_VIEW", "APPOINTMENTS_VIEW", "CUSTOMERS_VIEW"];
      const permissionRows = baselinePermissions.map((key) => ({
        staff_id: staffMember.id,
        tenant_id: invite.tenant_id,
        permission_key: key,
      }));

      await admin
        .from("staff_permissions")
        .upsert(permissionRows, { onConflict: "staff_id,permission_key" });
    }

    // ── 6. Mark Invitation as Accepted ───────────────────────────────
    await admin
      .from("invitations")
      .update({
        status: "accepted",
        accepted_at: new Date().toISOString(),
      })
      .eq("id", invite.id);

    return NextResponse.json({ success: true, redirectUrl: "/staff-portal" });
  } catch (err: any) {
    console.error("❌ [Complete Invitation Error]:", err);
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred while completing invitation." },
      { status: 500 }
    );
  }
}
