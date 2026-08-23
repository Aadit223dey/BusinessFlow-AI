import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = getSupabaseAdmin() || supabase;

    const { data: profile } = await admin
      .from("profiles")
      .select("id, role, tenant_id")
      .eq("id", user.id)
      .single();

    const isSuperAdmin =
      profile?.role === "SUPER_ADMIN" ||
      (user.email && user.email.toLowerCase() === "developer223aadit@gmail.com");

    let query = admin
      .from("invitations")
      .select("*")
      .order("created_at", { ascending: false });

    if (!isSuperAdmin) {
      if (!profile?.tenant_id) {
        return NextResponse.json({ invitations: [] });
      }
      query = query.eq("tenant_id", profile.tenant_id);
    }

    const { data: invitations, error } = await query;

    if (error) {
      console.error("Error fetching invitations:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ invitations: invitations || [] });
  } catch (err: any) {
    console.error("Unexpected error in GET /api/invitations:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await request.json();
        id = body.id;
      } catch {
        // No json body
      }
    }

    if (!id) {
      return NextResponse.json({ error: "Invitation ID is required." }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const admin = getSupabaseAdmin() || supabase;

    const { data: profile } = await admin
      .from("profiles")
      .select("id, role, tenant_id")
      .eq("id", user.id)
      .single();

    const isSuperAdmin =
      profile?.role === "SUPER_ADMIN" ||
      (user.email && user.email.toLowerCase() === "developer223aadit@gmail.com");

    const isBusinessOwner = profile?.role === "BUSINESS_OWNER";

    if (!isSuperAdmin && (!isBusinessOwner || !profile?.tenant_id)) {
      return NextResponse.json(
        { error: "Forbidden: Only Business Owners or Super Admins can cancel invitations." },
        { status: 403 }
      );
    }

    // Fetch target invitation
    let query = admin.from("invitations").select("id, tenant_id, auth_user_id, status, email").eq("id", id);
    if (!isSuperAdmin && profile?.tenant_id) {
      query = query.eq("tenant_id", profile.tenant_id);
    }
    const { data: invitation, error: fetchError } = await query.maybeSingle();

    if (fetchError || !invitation) {
      return NextResponse.json(
        { error: "Invitation not found or access denied." },
        { status: 404 }
      );
    }

    // If there was an unconfirmed Auth user created, remove from auth.users
    if (invitation.auth_user_id) {
      const adminClient = getSupabaseAdmin();
      if (adminClient) {
        try {
          await adminClient.auth.admin.deleteUser(invitation.auth_user_id);
        } catch (authDeleteErr) {
          console.warn("Failed to delete auth user during cancellation:", authDeleteErr);
        }
      }
    }

    // Delete row from public.invitations
    const { error: deleteError } = await admin
      .from("invitations")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting invitation:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete invitation record: " + deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Invitation for ${invitation.email} has been cancelled and removed.`,
    });
  } catch (err: any) {
    console.error("Unexpected error in DELETE /api/invitations:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
