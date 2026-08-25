import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json(
        {
          error: "NO_SESSION",
          message: "No authenticated invitation session found. Please use the link sent to your email.",
        },
        { status: 401 }
      );
    }

    const email = user.email.toLowerCase();
    const admin = getSupabaseAdmin();

    if (!admin) {
      // Fallback: try querying with the user's own session (RLS allows reading own email's invitations)
      const { data: invite } = await supabase
        .from("invitations")
        .select("id, tenant_id, email, invited_role, status, expires_at")
        .eq("email", email)
        .eq("status", "pending")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!invite) {
        return NextResponse.json(
          { error: "INVITATION_NOT_FOUND", message: "No active staff invitation exists for this account." },
          { status: 404 }
        );
      }

      return NextResponse.json({
        valid: true,
        email: invite.email,
        tenantName: "Your Team Workspace",
        invitedRole: invite.invited_role,
      });
    }

    // Use admin client to bypass RLS and join tenant name
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
      return NextResponse.json(
        { error: "INVITATION_NOT_FOUND", message: "No active staff invitation exists for this account." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      valid: true,
      email: invite.email,
      tenantId: invite.tenant_id,
      tenantName: (invite.tenant as any)?.name || "Your Team Workspace",
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
