import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/config/env";

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
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignore in route handler
            }
          },
        },
      }
    );

    // 1. Authenticate request session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse request body
    const body = await request.json();
    const { role } = body;

    // 3. Exploit Guard: Block SUPER_ADMIN or STAFF self-assignment
    if (role === "SUPER_ADMIN" || role === "STAFF") {
      return NextResponse.json(
        {
          error:
            "Forbidden: Self-assignment of SUPER_ADMIN or STAFF roles is strictly prohibited.",
        },
        { status: 403 }
      );
    }

    if (role !== "BUSINESS_OWNER" && role !== "CUSTOMER") {
      return NextResponse.json(
        { error: "Invalid role selection. Must be BUSINESS_OWNER or CUSTOMER." },
        { status: 400 }
      );
    }

    // 4. Update profile record
    const updates =
      role === "BUSINESS_OWNER"
        ? {
            role: "BUSINESS_OWNER",
            has_selected_role: true,
            has_completed_onboarding: false,
          }
        : {
            role: "CUSTOMER",
            has_selected_role: true,
            has_completed_onboarding: true,
          };

    const { error: updateError } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);

    if (updateError) {
      console.error("Error updating user role:", updateError);
      return NextResponse.json(
        { error: "Failed to update profile role." },
        { status: 500 }
      );
    }

    const redirectPath =
      role === "BUSINESS_OWNER" ? "/onboarding" : "/customer-portal";

    return NextResponse.json({ success: true, redirectPath }, { status: 200 });
  } catch (error) {
    console.error("Set role API error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
