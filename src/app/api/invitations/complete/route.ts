import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json({ error: "Unauthorized: No active session" }, { status: 401 });
    }

    const { password, firstName, lastName } = await req.json();

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const email = user.email.toLowerCase();
    const admin = getSupabaseAdmin() || supabase;

    // ── 1. Re-validate invitation record atomically ─────────────────
    const { data: invite, error: inviteErr } = await admin
      .from("invitations")
      .select("id, tenant_id")
      .eq("email", email)
      .eq("status", "pending")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (inviteErr || !invite) {
      return NextResponse.json(
        { error: "Invitation is no longer valid, expired, or has already been used." },
        { status: 400 }
      );
    }

    // ── 2. Set permanent password in Supabase Auth ──────────────────
    const { error: pwdErr } = await supabase.auth.updateUser({ password });
    if (pwdErr) {
      return NextResponse.json({ error: pwdErr.message }, { status: 422 });
    }

    // ── 3. Update public.profiles (STAFF binding) ───────────────────
    const { error: profileErr } = await admin
      .from("profiles")
      .update({
        first_name: firstName?.trim() || null,
        last_name: lastName?.trim() || null,
        role: "STAFF",
        tenant_id: invite.tenant_id,
        has_selected_role: true,
        has_completed_onboarding: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (profileErr) {
      console.error("❌ [PROFILE_UPDATE_FAILED]:", profileErr);
      return NextResponse.json({ error: "Failed to update user profile" }, { status: 500 });
    }

    // ── 4. Provision staff_members record (Idempotent upsert) ───────
    const { data: staffMember, error: staffErr } = await admin
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

    if (staffErr) {
      console.error("❌ [STAFF_RECORD_FAILED]:", staffErr);
    }

    // ── 5. Grant baseline permissions ───────────────────────────────
    if (staffMember?.id) {
      const defaultPermissions = ["SERVICES_VIEW", "APPOINTMENTS_VIEW", "CUSTOMERS_VIEW"];
      const rows = defaultPermissions.map((perm) => ({
        staff_id: staffMember.id,
        tenant_id: invite.tenant_id,
        permission_key: perm,
      }));

      await admin
        .from("staff_permissions")
        .upsert(rows, { onConflict: "staff_id,permission_key" });
    }

    // ── 6. Mark invitation as accepted ──────────────────────────────
    await admin
      .from("invitations")
      .update({
        status: "accepted",
        accepted_at: new Date().toISOString(),
      })
      .eq("id", invite.id);

    return NextResponse.json({ success: true, redirectUrl: "/staff-portal" });
  } catch (err: any) {
    console.error("❌ [COMPLETE_INVITATION_EXCEPTION]:", err);
    return NextResponse.json(
      { error: err.message || "Failed to complete registration" },
      { status: 500 }
    );
  }
}
