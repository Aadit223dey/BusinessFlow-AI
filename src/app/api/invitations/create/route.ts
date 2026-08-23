import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { env } from "@/config/env";
import { logger } from "@/lib/logger";
import { parseAuthError } from "@/lib/auth-errors";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const createInviteSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .transform((val) => val.toLowerCase().trim()),
  invited_role: z.literal("STAFF").optional().default("STAFF"),
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

    // ─── 1. Authenticate user & verify BUSINESS_OWNER profile ─────────
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      logger.warn("Unauthorized staff invitation attempt", { operation: "invitations.create" });
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

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
        { error: "Forbidden: Only Business Owners can invite staff members to their workspace." },
        { status: 403 }
      );
    }

    // ─── 2. Validate request payload ──────────────────────────────────
    const body = await request.json();
    const validation = createInviteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || "Invalid input payload" },
        { status: 400 }
      );
    }

    const { email, invited_role } = validation.data;

    // ─── 3. Duplicate Checks ──────────────────────────────────────────
    // Check if active (pending) invitation already exists for this tenant
    const { data: existingInvite } = await supabase
      .from("invitations")
      .select("id")
      .eq("tenant_id", profile.tenant_id)
      .eq("email", email)
      .eq("status", "pending")
      .maybeSingle();

    if (existingInvite) {
      return NextResponse.json(
        { error: "An active invitation or pending request already exists for this email address." },
        { status: 409 }
      );
    }

    // ─── 4. Token & Redirect Generation ───────────────────────────────
    const invitation_token = crypto.randomBytes(16).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      request.headers.get("origin") ||
      request.headers.get("referer")?.replace(/\/$/, "") ||
      "http://localhost:3000";

    const inviteLink = `${siteUrl}/invite/accept?token=${invitation_token}`;

    // ─── 5. Privileged Supabase Auth Admin Dispatch ───────────────────
    const admin = getSupabaseAdmin();
    if (!admin) {
      logger.error("Missing SUPABASE_SERVICE_ROLE_KEY for server invitation dispatch", {
        operation: "invitations.create",
      });
      return NextResponse.json(
        {
          error:
            "Server email dispatch is unavailable: SUPABASE_SERVICE_ROLE_KEY is not configured on the server. Please add your Supabase Service Role Key to .env.local.",
        },
        { status: 500 }
      );
    }

    const { data: authData, error: inviteError } =
      await admin.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${siteUrl}/invite/accept`,
        data: {
          tenant_id: profile.tenant_id,
          invited_role: "STAFF",
          invitation_token,
        },
      });

    // ─── 6. Failure Handling (Atomic: No DB record on failure) ────────
    if (inviteError) {
      logger.error("Supabase Auth admin.inviteUserByEmail failed", {
        operation: "invitations.create",
        code: inviteError.code,
        status: inviteError.status,
        message: inviteError.message,
        email,
      });

      const errMessage = inviteError.message.toLowerCase();

      // Rate limit check
      if (errMessage.includes("rate limit") || inviteError.status === 429) {
        return NextResponse.json(
          {
            error:
              "Email rate limit reached for the development provider. Please wait a few minutes before inviting another member.",
          },
          { status: 429 }
        );
      }

      // User already registered check
      if (
        errMessage.includes("already registered") ||
        errMessage.includes("user already exists") ||
        inviteError.status === 409
      ) {
        return NextResponse.json(
          {
            error:
              "An account with this email address already exists. The user can be assigned to your workspace directly.",
          },
          { status: 409 }
        );
      }

      // Email provider rejection / unwhitelisted recipient
      if (
        errMessage.includes("not authorized") ||
        errMessage.includes("rejected") ||
        errMessage.includes("whitelist") ||
        inviteError.status === 422
      ) {
        return NextResponse.json(
          {
            error:
              "The email provider rejected this address. In development, default Supabase mailer only sends to project organization members. Please whitelist this address or configure custom SMTP.",
          },
          { status: 422 }
        );
      }

      // Generic parsed error
      const parsed = parseAuthError(inviteError);
      return NextResponse.json(
        { error: parsed.message || "Failed to dispatch email invitation." },
        { status: inviteError.status || 422 }
      );
    }

    // ─── 7. Database Synchronization (Transactional upon Auth 200 OK) ─
    const { data: invitation, error: insertError } = await supabase
      .from("invitations")
      .insert({
        tenant_id: profile.tenant_id,
        invited_by: profile.id,
        email,
        invited_role,
        invitation_token,
        status: "pending",
        expires_at: expiresAt,
        auth_user_id: authData?.user?.id || null,
      })
      .select()
      .single();

    if (insertError) {
      logger.error("Failed to insert invitation tracking record", {
        operation: "invitations.create",
        error: insertError,
      });
      const parsed = parseAuthError(insertError);
      return NextResponse.json({ error: parsed.message }, { status: 400 });
    }

    logger.info("Staff invitation created and dispatched successfully", {
      operation: "invitations.create",
      invitationId: invitation.id,
      authUserId: authData?.user?.id,
      email,
      inviteLink,
    });

    return NextResponse.json(
      {
        message: `Invitation email dispatched successfully to ${email}.`,
        invitation: {
          ...invitation,
          inviteLink,
          auth_user_id: authData?.user?.id,
          emailSent: true,
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
