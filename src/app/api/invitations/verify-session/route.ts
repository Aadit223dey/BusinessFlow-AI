import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { searchParams } = new URL(req.url);
    const emailParam = searchParams.get("email");

    const emailToVerify = user?.email || emailParam;

    if (!emailToVerify) {
      return NextResponse.json(
        { error: "No authenticated invited session found." },
        { status: 401 }
      );
    }

    const normalizedEmail = emailToVerify.trim().toLowerCase();
    const admin = getSupabaseAdmin() || supabase;

    // Find active pending invitation for this email
    const { data: invite, error: inviteError } = await admin
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
      .eq("email", normalizedEmail)
      .eq("status", "pending")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (inviteError || !invite) {
      return NextResponse.json(
        {
          error: "No active or valid pending invitation found for this email address.",
          code: "INVITE_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      valid: true,
      email: invite.email,
      tenantName: (invite.tenant as any)?.name || "Business Workspace",
      invitedRole: invite.invited_role,
    });
  } catch (err: any) {
    console.error("❌ [Verify Session Error]:", err);
    return NextResponse.json(
      { error: err.message || "Failed to verify invitation session." },
      { status: 500 }
    );
  }
}
