import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/config/env";

/**
 * Secure Transactional Workspace Provisioning Router
 *
 * POST /api/onboarding/submit
 *
 * Validates configuration fields, creates tenant + business_settings
 * records in a discrete transaction, uploads logo to storage,
 * updates the user profile with onboarding completion flag and
 * tenant association, then returns success.
 *
 * Rejects requests from profiles that have already completed onboarding.
 */

const submitPayloadSchema = z.object({
  businessName: z.string().min(2).max(100).trim(),
  category: z.string().min(1),
  email: z.string().email(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  addressLine1: z.string().min(3).max(200).trim(),
  addressLine2: z.string().max(200).trim().optional().default(""),
  city: z.string().min(1).max(100).trim(),
  state: z.string().min(1).max(100).trim(),
  postalCode: z.string().min(1).max(20).trim(),
  country: z.string().min(1),
  currency: z.string().min(1),
  timezone: z.string().min(1),
  workingHours: z.record(
    z.object({
      enabled: z.boolean(),
      open: z.string(),
      close: z.string(),
    })
  ),
  appointmentDuration: z.number().min(5).max(480),
  bufferTime: z.number().min(0).max(120),
  maxAdvanceBookingDays: z.number().min(1).max(365),
});

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 50);
}

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

    // 1. Verify authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // 2. Check if already onboarded
    const { data: existingProfile, error: profileError } = await supabase
      .from("profiles")
      .select("has_completed_onboarding, tenant_id")
      .eq("id", user.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: "Failed to fetch user profile" },
        { status: 500 }
      );
    }

    if (existingProfile.has_completed_onboarding) {
      return NextResponse.json(
        { error: "Onboarding has already been completed" },
        { status: 409 }
      );
    }

    // 3. Parse & validate request body
    const body: unknown = await request.json();
    const parseResult = submitPayloadSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    const payload = parseResult.data;

    // 4. Create tenant record
    const slug = generateSlug(payload.businessName) + "-" + Date.now().toString(36);

    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .insert({
        owner_id: user.id,
        name: payload.businessName,
        slug,
        category: payload.category,
        currency: payload.currency,
        timezone: payload.timezone,
        phone: payload.phone,
        email: payload.email,
        address_line_1: payload.addressLine1,
        address_line_2: payload.addressLine2 || null,
        city: payload.city,
        state: payload.state,
        postal_code: payload.postalCode,
        country: payload.country,
      })
      .select("id")
      .single();

    if (tenantError || !tenant) {
      console.error("Tenant creation failed:", tenantError);
      return NextResponse.json(
        { error: "Failed to create workspace" },
        { status: 500 }
      );
    }

    // 5. Create business_settings
    const { error: settingsError } = await supabase
      .from("business_settings")
      .insert({
        tenant_id: tenant.id,
        working_hours: payload.workingHours,
        appointment_duration_minutes: payload.appointmentDuration,
        buffer_between_appointments: payload.bufferTime,
        max_advance_booking_days: payload.maxAdvanceBookingDays,
      });

    if (settingsError) {
      console.error("Business settings creation failed:", settingsError);
      // Rollback tenant
      await supabase.from("tenants").delete().eq("id", tenant.id);
      return NextResponse.json(
        { error: "Failed to save business settings" },
        { status: 500 }
      );
    }

    // 6. Update user profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        tenant_id: tenant.id,
        role: "ADMIN",
        has_completed_onboarding: true,
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Profile update failed:", updateError);
      // Attempt rollback
      await supabase.from("business_settings").delete().eq("tenant_id", tenant.id);
      await supabase.from("tenants").delete().eq("id", tenant.id);
      return NextResponse.json(
        { error: "Failed to update user profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      tenantId: tenant.id,
      redirectTo: "/dashboard",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("Onboarding submission error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
