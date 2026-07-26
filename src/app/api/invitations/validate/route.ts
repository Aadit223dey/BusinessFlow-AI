import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { env } from "@/config/env";
import { logger } from "@/lib/logger";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Invitation token is required" }, { status: 400 });
    }

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
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    // Fetch invitation record using invitation_token
    const { data: invitation, error } = await supabase
      .from("invitations")
      .select("id, tenant_id, invited_by, email, invited_role, status, expires_at")
      .eq("invitation_token", token)
      .maybeSingle();

    if (error || !invitation) {
      logger.warn("Invitation token lookup failed: Invalid token", {
        operation: "invitations.validate",
        token,
      });
      return NextResponse.json(
        { error: "This invitation link is invalid or does not exist." },
        { status: 400 }
      );
    }

    // Check status
    if (invitation.status !== "pending") {
      return NextResponse.json(
        { error: `This invitation link is no longer active (Status: ${invitation.status}).` },
        { status: 400 }
      );
    }

    // Check expiration
    const isExpired = new Date(invitation.expires_at).getTime() <= Date.now();
    if (isExpired) {
      // Mark as expired
      await supabase
        .from("invitations")
        .update({ status: "expired" })
        .eq("id", invitation.id);

      logger.warn("Invitation token expired", {
        operation: "invitations.validate",
        invitationId: invitation.id,
      });

      return NextResponse.json(
        { error: "This invitation link has expired. Please request a new invitation." },
        { status: 410 }
      );
    }

    // Fetch Tenant & Inviter information
    const { data: tenant } = await supabase
      .from("tenants")
      .select("name")
      .eq("id", invitation.tenant_id)
      .single();

    const { data: inviterProfile } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", invitation.invited_by)
      .single();

    const tenantName = tenant?.name || "BusinessFlow AI Workspace";
    const inviterName = inviterProfile?.first_name
      ? `${inviterProfile.first_name} ${inviterProfile.last_name || ""}`.trim()
      : "Business Owner";

    logger.info("Invitation token validated successfully", {
      operation: "invitations.validate",
      invitationId: invitation.id,
      email: invitation.email,
    });

    return NextResponse.json({
      valid: true,
      email: invitation.email,
      tenantName,
      invitedRole: invitation.invited_role,
      expiresAt: invitation.expires_at,
      inviterName,
    });
  } catch (err) {
    logger.error("Unexpected error validating invitation token", {
      operation: "invitations.validate",
      error: err,
    });
    return NextResponse.json(
      { error: "An unexpected error occurred while validating invitation." },
      { status: 500 }
    );
  }
}
