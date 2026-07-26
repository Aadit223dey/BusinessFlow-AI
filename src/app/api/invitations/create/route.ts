import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { env } from "@/config/env";
import { logger } from "@/lib/logger";
import { parseAuthError } from "@/lib/auth-errors";

const createInviteSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  role: z.literal("STAFF").default("STAFF"),
});

export async function POST(request: Request) {
  try {
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

    // 1. Verify requester session & role
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      logger.warn("Unauthorized staff invitation attempt", { operation: "invitations.create" });
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Retrieve inviter profile to verify BUSINESS_OWNER status and tenant_id
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role, tenant_id, first_name, last_name")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "BUSINESS_OWNER" || !profile.tenant_id) {
      logger.warn("Forbidden invitation attempt: Requester is not a tenant Business Owner", {
        operation: "invitations.create",
        userId: user.id,
      });
      return NextResponse.json(
        { error: "Forbidden: Only Business Owners can invite staff members." },
        { status: 403 }
      );
    }

    // Retrieve tenant details
    const { data: tenant } = await supabase
      .from("tenants")
      .select("name")
      .eq("id", profile.tenant_id)
      .single();

    const businessName = tenant?.name || "BusinessFlow AI Workspace";
    const inviterName = profile.first_name
      ? `${profile.first_name} ${profile.last_name || ""}`.trim()
      : user.email || "Business Owner";

    // 2. Validate payload
    const body = await request.json();
    const validation = createInviteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || "Invalid input payload" },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    // 3. Generate crypto-secure 32-character token
    const token = crypto.randomBytes(16).toString("hex");

    // 4. Insert row into public.invitations
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: invitation, error: insertError } = await supabase
      .from("invitations")
      .insert({
        tenant_id: profile.tenant_id,
        invited_by: profile.id,
        email: email.toLowerCase().trim(),
        role: "STAFF",
        token,
        status: "PENDING",
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (insertError) {
      logger.error("Failed to insert invitation record", {
        operation: "invitations.create",
        error: insertError,
      });
      const parsed = parseAuthError(insertError);
      return NextResponse.json({ error: parsed.message }, { status: 400 });
    }

    // Construct full invitation URL
    const origin = request.headers.get("origin") || request.headers.get("referer") || "http://localhost:3000";
    const inviteLink = `${origin}/invite/accept?token=${token}`;

    // Log structured trace for development and delivery
    logger.info("Staff invitation link generated", {
      operation: "invitations.create",
      invitationId: invitation.id,
      email,
      businessName,
      inviterName,
      inviteLink,
    });

    return NextResponse.json(
      {
        message: "Staff invitation created successfully.",
        invitation: {
          id: invitation.id,
          email: invitation.email,
          role: invitation.role,
          status: invitation.status,
          expires_at: invitation.expires_at,
          inviteLink,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    logger.error("Unexpected exception in invitation creation", {
      operation: "invitations.create",
      error: err,
    });
    const parsed = parseAuthError(err);
    return NextResponse.json({ error: parsed.message }, { status: 500 });
  }
}
