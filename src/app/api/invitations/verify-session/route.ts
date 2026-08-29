import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user || !user.email) {
      return NextResponse.json(
        {
          error: "NO_SESSION",
          message:
            "No authenticated session detected. Please open the link directly from your invitation email.",
        },
        { status: 401 }
      );
    }

    const email = user.email.toLowerCase().trim();
    const admin = getSupabaseAdmin() || supabase;

    // Query pending invitation
    const { data: invite, error: dbError } = await admin
      .from("invitations")
      .select(`
        id,
        tenant_id,
        email,
        invited_role,
        status,
        expires_at,
        tenant:tenants (id, name)
      `)
      .eq("email", email)
      .eq("status", "pending")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (dbError || !invite) {
      // Check if user is already an accepted staff member
      const { data: profile } = await admin
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role === "STAFF") {
        return NextResponse.json({ alreadyAccepted: true, redirectUrl: "/staff-portal" });
      }

      return NextResponse.json(
        {
          error: "INVITATION_NOT_FOUND",
          message: "No active staff invitation found for this email address.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      valid: true,
      email: invite.email,
      tenantId: invite.tenant_id,
      tenantName: (invite.tenant as any)?.name || "Team Workspace",
      invitedRole: invite.invited_role,
    });
  } catch (err: any) {
    console.error("❌ [VERIFY_SESSION_ERROR]:", err);
    return NextResponse.json(
      { error: "SERVER_ERROR", message: "Verification failed" },
      { status: 500 }
    );
  }
}
