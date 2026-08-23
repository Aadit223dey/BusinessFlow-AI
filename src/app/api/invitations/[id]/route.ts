import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // 1. Verify caller profile is BUSINESS_OWNER
    const { data: profile } = await admin
      .from("profiles")
      .select("id, role, tenant_id")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "BUSINESS_OWNER" || !profile.tenant_id) {
      return NextResponse.json(
        { error: "Forbidden: Only Business Owners can cancel invitations." },
        { status: 403 }
      );
    }

    // 2. Fetch target invitation record
    const { data: invitation, error: fetchError } = await admin
      .from("invitations")
      .select("id, tenant_id, auth_user_id, status, email")
      .eq("id", id)
      .eq("tenant_id", profile.tenant_id)
      .single();

    if (fetchError || !invitation) {
      return NextResponse.json(
        { error: "Invitation not found or access denied." },
        { status: 404 }
      );
    }

    // 3. If there was an unconfirmed Auth user created, remove from auth.users
    if (invitation.auth_user_id) {
      const adminClient = getSupabaseAdmin();
      if (adminClient) {
        try {
          await adminClient.auth.admin.deleteUser(invitation.auth_user_id);
        } catch (authDeleteErr) {
          console.warn("Failed to delete auth user during invitation cancellation:", authDeleteErr);
        }
      }
    }

    // 4. Delete row from public.invitations
    const { error: deleteError } = await admin
      .from("invitations")
      .delete()
      .eq("id", id)
      .eq("tenant_id", profile.tenant_id);

    if (deleteError) {
      console.error("Error deleting invitation:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete invitation record." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Invitation for ${invitation.email} has been cancelled and removed.`,
    });
  } catch (err: any) {
    console.error("Unexpected error in invitation DELETE:", err);
    return NextResponse.json(
      { error: err.message || "Failed to cancel invitation." },
      { status: 500 }
    );
  }
}
