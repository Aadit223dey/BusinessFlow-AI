import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { env } from "@/config/env";
import { logger } from "@/lib/logger";
import { parseAuthError } from "@/lib/auth-errors";

const createInviteSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address").transform((val) => val.toLowerCase().trim()),
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

    // 1. Authenticate user & verify BUSINESS_OWNER profile
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      logger.warn("Unauthorized staff invitation attempt", { operation: "invitations.create" });
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
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
        { error: "Forbidden: Only Business Owners can invite staff members." },
        { status: 403 }
      );
    }

    // 2. Validate request payload
    const body = await request.json();
    const validation = createInviteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || "Invalid input payload" },
        { status: 400 }
      );
    }

    const { email, invited_role } = validation.data;

    // 3. Duplicate Prevention: Check if active (pending) invitation already exists for this tenant
    const { data: existingInvite } = await supabase
      .from("invitations")
      .select("id")
      .eq("tenant_id", profile.tenant_id)
      .eq("email", email)
      .eq("status", "pending")
      .maybeSingle();

    if (existingInvite) {
      return NextResponse.json(
        { error: "An active invitation has already been sent to this email address." },
        { status: 409 }
      );
    }

    // 4. Generate 32-character hexadecimal cryptographically secure token
    const invitation_token = crypto.randomBytes(16).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    // 5. Insert row into public.invitations
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

    // 6. Construct invitation link
    const origin = request.headers.get("origin") || request.headers.get("referer") || "http://localhost:3000";
    const inviteLink = `${origin}/invite/accept?token=${invitation_token}`;

    // 7. Dispatch via Supabase Native Email System if SUPABASE_SERVICE_ROLE_KEY is provided
    let emailSent = false;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (serviceRoleKey) {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabaseAdmin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, serviceRoleKey);

        const { error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
          redirectTo: inviteLink,
          data: {
            role: "STAFF",
            tenant_id: profile.tenant_id,
            invitation_token,
          },
        });

        if (!inviteError) {
          emailSent = true;
          logger.info("Invitation email dispatched via Supabase Native Auth Email System", {
            operation: "invitations.create",
            email,
            inviteLink,
          });
        } else {
          logger.warn("Supabase native inviteUserByEmail note", {
            operation: "invitations.create",
            email,
            error: inviteError.message,
          });
        }
      } catch (adminErr) {
        logger.warn("Supabase admin invitation dispatch error", {
          operation: "invitations.create",
          error: adminErr,
        });
      }
    }

    logger.info("Staff invitation record created successfully", {
      operation: "invitations.create",
      invitationId: invitation.id,
      email,
      inviteLink,
      emailSent,
    });

    return NextResponse.json(
      {
        message: "Staff invitation created successfully via Supabase Email System.",
        invitation: {
          ...invitation,
          inviteLink,
          emailSent,
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
