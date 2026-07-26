import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/config/env";
import { logger } from "@/lib/logger";
import { parseAuthError } from "@/lib/auth-errors";

const acceptInviteSchema = z.object({
  token: z.string().min(1, "Invitation token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
  firstName: z.string().min(1, "First name is required").trim(),
  lastName: z.string().min(1, "Last name is required").trim(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = acceptInviteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || "Invalid input payload" },
        { status: 400 }
      );
    }

    const { token, password, firstName, lastName } = validation.data;

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

    // 1. Fetch & re-validate invitation record using invitation_token
    const { data: invitation, error: invError } = await supabase
      .from("invitations")
      .select("id, tenant_id, email, status, expires_at")
      .eq("invitation_token", token)
      .maybeSingle();

    if (invError || !invitation) {
      return NextResponse.json(
        { error: "Invalid invitation token." },
        { status: 400 }
      );
    }

    if (invitation.status !== "pending") {
      return NextResponse.json(
        { error: `Invitation is no longer active (Status: ${invitation.status}).` },
        { status: 400 }
      );
    }

    if (new Date(invitation.expires_at).getTime() <= Date.now()) {
      await supabase
        .from("invitations")
        .update({ status: "expired" })
        .eq("id", invitation.id);

      return NextResponse.json(
        { error: "Invitation has expired. Please request a new invitation link." },
        { status: 410 }
      );
    }

    // 2. Sign up candidate user via Supabase Auth
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: invitation.email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: "STAFF",
          tenant_id: invitation.tenant_id,
        },
      },
    });

    if (signUpError) {
      logger.error("Supabase Auth signUp failed during invitation acceptance", {
        operation: "invitations.accept",
        error: signUpError,
      });
      const parsed = parseAuthError(signUpError);
      return NextResponse.json({ error: parsed.message }, { status: 400 });
    }

    const userId = authData.user?.id;

    if (userId) {
      // 3. Update public.profiles row setting role = 'STAFF', tenant_id, onboarding flags
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: userId,
          role: "STAFF",
          tenant_id: invitation.tenant_id,
          has_selected_role: true,
          has_completed_onboarding: true,
          first_name: firstName,
          last_name: lastName,
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        logger.error("Failed to update profile for accepted invitation", {
          operation: "invitations.accept",
          userId,
          error: profileError,
        });
      }
    }

    // 4. Update public.invitations status to 'accepted' & accepted_at = NOW()
    await supabase
      .from("invitations")
      .update({
        status: "accepted",
        accepted_at: new Date().toISOString(),
      })
      .eq("id", invitation.id);

    logger.info("Invitation accepted successfully. Candidate account created and linked.", {
      operation: "invitations.accept",
      invitationId: invitation.id,
      userId,
      tenantId: invitation.tenant_id,
    });

    return NextResponse.json({
      message: "Invitation accepted successfully! Welcome to your staff workspace.",
      redirectPath: "/staff-portal",
    });
  } catch (err) {
    logger.error("Unexpected error during invitation acceptance", {
      operation: "invitations.accept",
      error: err,
    });
    const parsed = parseAuthError(err);
    return NextResponse.json({ error: parsed.message }, { status: 500 });
  }
}
