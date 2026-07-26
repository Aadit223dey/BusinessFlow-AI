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

    // Fetch invitation record
    const { data: invitation, error } = await supabase
      .from("invitations")
      .select("id, tenant_id, invited_by, email, role, status, expires_at")
      .eq("token", token)
      .single();

    if (error || !invitation) {
      logger.warn("Invitation token lookup failed: Invalid token", {
        operation: "invitations.validate",
        token,
      });
      return NextResponse.json(
        { error: "This invitation link is invalid or does not exist." },
        { status: 404 }
      );
    }

    // Check status
    if (invitation.status !== "PENDING") {
      return NextResponse.json(
        { error: `This invitation link is no longer valid (Status: ${invitation.status}).` },
        { status: 400 }
      );
    }

    // Check expiration
    const isExpired = new Date(invitation.expires_at).getTime() <= Date.now();
    if (isExpired) {
      // Mark as EXPIRED
      await supabase
        .from("invitations")
        .update({ status: "EXPIRED" })
        .eq("id", invitation.id);

      logger.warn("Invitation token expired", {
        operation: "invitations.validate",
        invitationId: invitation.id,
      });

      return NextResponse.json(
        { error: "This invitation link has expired. Please request a new invitation." },
        { status: 400 }
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

    const businessName = tenant?.name || "BusinessFlow AI Workspace";
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
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        businessName,
        inviterName,
        expiresAt: invitation.expires_at,
      },
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
