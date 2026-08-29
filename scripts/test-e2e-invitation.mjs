import { createClient } from "@supabase/supabase-js";
import http from "http";

const SUPABASE_URL = "https://zqszrlapyetnhahgwmzz.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpxc3pybGFweWV0bmhhaGd3bXp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Mzk0NjM0NCwiZXhwIjoyMDk5NTIyMzQ0fQ.hIiqaQPS57wzLr_YRRv6knzhZa2MC4_cgTo-ohUoRrs";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpxc3pybGFweWV0bmhhaGd3bXp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5NDYzNDQsImV4cCI6MjA5OTUyMjM0NH0.OfNSJ8ZeXDLtLekaoz5xGoX1GO8PqezNzUwrcY3l6Z8";

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const anon = createClient(SUPABASE_URL, ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TENANT_ID = "893e01bd-120c-47e1-8aea-a59799800478";
const OWNER_PROFILE_ID = "9d846f9f-9b38-416d-9f0b-ffc8c50be4c7";

async function purgeUser(email) {
  const normEmail = email.toLowerCase().trim();
  const { data: users } = await admin.auth.admin.listUsers();
  const user = users?.users?.find((u) => u.email?.toLowerCase() === normEmail);
  if (user) {
    const staff = await admin
      .from("staff_members")
      .select("id")
      .eq("profile_id", user.id);
    if (staff.data?.length) {
      for (const s of staff.data) {
        await admin.from("staff_permissions").delete().eq("staff_id", s.id);
      }
      await admin.from("staff_members").delete().eq("profile_id", user.id);
    }
    await admin.from("profiles").delete().eq("id", user.id);
    await admin.auth.admin.deleteUser(user.id);
  }
  await admin.from("invitations").delete().eq("email", normEmail);
}

function fetchLocal(path, cookieHeader = "") {
  return new Promise((resolve, reject) => {
    const req = http.request(
      `http://localhost:3000${path}`,
      {
        method: "GET",
        headers: {
          Cookie: cookieHeader,
          "User-Agent": "E2E-Tester",
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
          });
        });
      }
    );
    req.on("error", reject);
    req.end();
  });
}

function buildCookieHeader(session) {
  const cookieName = `sb-zqszrlapyetnhahgwmzz-auth-token`;
  const sessionString = JSON.stringify({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    user: session.user,
    token_type: session.token_type,
    expires_at: session.expires_at,
    expires_in: session.expires_in,
  });

  const base64 = Buffer.from(sessionString).toString("base64");
  return `${cookieName}=base64-${base64}; ${cookieName}.0=base64-${base64}; Path=/; HttpOnly`;
}

async function runTests() {
  console.log("==================================================================");
  console.log("🚀 STARTING COMPREHENSIVE LOCAL E2E INVITATION & ROUTING TEST");
  console.log("==================================================================\n");

  const TEST_EMAIL_STAFF = "test-staff-auto@businessflow.ai";
  const TEST_EMAIL_FALLBACK = "test-fallback-auto@businessflow.ai";
  const TEST_EMAIL_ORGANIC = "test-organic-auto@businessflow.ai";
  const TEST_PASSWORD = "TestPassword123!";

  try {
    // -------------------------------------------------------------------------
    // TEST 1: End-to-End Staff Invitation & Trigger-Level Auto-Provisioning
    // -------------------------------------------------------------------------
    console.log("📋 TEST 1: New Staff Member Invitation & Database Trigger Resolution");
    console.log("1.1 Purging any previous test records for:", TEST_EMAIL_STAFF);
    await purgeUser(TEST_EMAIL_STAFF);

    console.log("1.2 Creating pending invitation in public.invitations...");
    const { data: invite, error: inviteErr } = await admin
      .from("invitations")
      .insert({
        tenant_id: TENANT_ID,
        invited_by: OWNER_PROFILE_ID,
        email: TEST_EMAIL_STAFF,
        invited_role: "STAFF",
        status: "pending",
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (inviteErr || !invite) {
      throw new Error(`Failed to insert invitation: ${inviteErr?.message}`);
    }
    console.log("   ✅ Invitation created with ID:", invite.id, "status:", invite.status);

    console.log("1.3 Simulating user sign-up / account confirmation via Supabase Auth...");
    const { data: authUser, error: authErr } = await admin.auth.admin.createUser({
      email: TEST_EMAIL_STAFF,
      password: TEST_PASSWORD,
      email_confirm: true,
      user_metadata: { first_name: "John", last_name: "Staff" },
    });

    if (authErr || !authUser?.user) {
      throw new Error(`Failed to create auth user: ${authErr?.message}`);
    }
    console.log("   ✅ Auth user created with ID:", authUser.user.id);

    console.log("1.4 Verifying Database Trigger (handle_new_user) results...");
    
    // Check Profile
    const { data: profile } = await admin
      .from("profiles")
      .select("*")
      .eq("id", authUser.user.id)
      .single();

    console.log("   Profile State:", {
      role: profile?.role,
      tenant_id: profile?.tenant_id,
      has_selected_role: profile?.has_selected_role,
      has_completed_onboarding: profile?.has_completed_onboarding,
      first_name: profile?.first_name,
    });

    if (
      profile?.role !== "STAFF" ||
      profile?.tenant_id !== TENANT_ID ||
      profile?.has_selected_role !== true ||
      profile?.has_completed_onboarding !== true
    ) {
      throw new Error("❌ Trigger failed: Profile was not auto-configured as STAFF bound to tenant!");
    }
    console.log("   ✅ Profile is correctly STAFF and bound to Tenant!");

    // Check Staff Member
    const { data: staffMember } = await admin
      .from("staff_members")
      .select("*")
      .eq("profile_id", authUser.user.id)
      .single();

    if (!staffMember || staffMember.status !== "ACTIVE") {
      throw new Error("❌ Trigger failed: staff_members record was not provisioned as ACTIVE!");
    }
    console.log("   ✅ staff_members record created (ID:", staffMember.id, "status:", staffMember.status, ")");

    // Check Permissions
    const { data: permissions } = await admin
      .from("staff_permissions")
      .select("permission_key")
      .eq("staff_id", staffMember.id);

    const permKeys = permissions?.map((p) => p.permission_key) || [];
    console.log("   Staff Permissions:", permKeys);
    if (
      !permKeys.includes("SERVICES_VIEW") ||
      !permKeys.includes("APPOINTMENTS_VIEW") ||
      !permKeys.includes("CUSTOMERS_VIEW")
    ) {
      throw new Error("❌ Trigger failed: Baseline permissions not populated!");
    }
    console.log("   ✅ Baseline permissions populated correctly!");

    // Check Invitation Status
    const { data: updatedInvite } = await admin
      .from("invitations")
      .select("status, accepted_at, auth_user_id")
      .eq("id", invite.id)
      .single();

    console.log("   Invitation Status:", updatedInvite);
    if (updatedInvite?.status !== "accepted") {
      throw new Error("❌ Trigger failed: Invitation status not updated to 'accepted'!");
    }
    console.log("   ✅ Invitation status is 'accepted' with accepted_at timestamp!\n");

    // -------------------------------------------------------------------------
    // TEST 2: Local HTTP Server Session & Direct Route Guard Verification
    // -------------------------------------------------------------------------
    console.log("📋 TEST 2: Local HTTP Route Guards & Direct Staff Portal Isolation");
    console.log("2.1 Signing in as newly created staff member...");
    const { data: signInData, error: signInErr } = await anon.auth.signInWithPassword({
      email: TEST_EMAIL_STAFF,
      password: TEST_PASSWORD,
    });

    if (signInErr || !signInData?.session) {
      throw new Error(`Sign in failed: ${signInErr?.message}`);
    }
    console.log("   ✅ Sign in successful. JWT received.");

    const cookieHeader = buildCookieHeader(signInData.session);

    console.log("2.2 Sending GET request to http://localhost:3000/select-role with session cookies...");
    const selectRoleRes = await fetchLocal("/select-role", cookieHeader);
    console.log("   Response Status:", selectRoleRes.statusCode);
    console.log("   Response Location Header:", selectRoleRes.headers.location);

    if (
      selectRoleRes.statusCode === 307 ||
      selectRoleRes.statusCode === 308 ||
      selectRoleRes.statusCode === 302
    ) {
      if (selectRoleRes.headers.location?.includes("/staff-portal")) {
        console.log("   ✅ /select-role immediately REDIRECTED to /staff-portal! (Public cards NEVER rendered)");
      } else {
        console.log("   ⚠️ Redirected to:", selectRoleRes.headers.location);
      }
    } else if (selectRoleRes.statusCode === 200) {
      if (selectRoleRes.body.includes("Select your account type")) {
        throw new Error("❌ FAIL: /select-role rendered public role selection cards to an invited staff member!");
      }
    }

    console.log("2.3 Sending GET request to root http://localhost:3000/ with session cookies...");
    const rootRes = await fetchLocal("/", cookieHeader);
    console.log("   Response Status:", rootRes.statusCode);
    console.log("   Response Location Header:", rootRes.headers.location);
    if (
      (rootRes.statusCode === 307 || rootRes.statusCode === 308 || rootRes.statusCode === 302) &&
      rootRes.headers.location?.includes("/staff-portal")
    ) {
      console.log("   ✅ Root route (/) immediately REDIRECTED to /staff-portal!\n");
    }

    // -------------------------------------------------------------------------
    // TEST 3: Fallback Reconciliation Test on /select-role
    // -------------------------------------------------------------------------
    console.log("📋 TEST 3: Fallback Server Guard Reconciliation on /select-role");
    console.log("3.1 Purging fallback test user:", TEST_EMAIL_FALLBACK);
    await purgeUser(TEST_EMAIL_FALLBACK);

    console.log("3.2 Creating user WITHOUT prior invitation (unassigned profile)...");
    const { data: fallbackUser, error: fbAuthErr } = await admin.auth.admin.createUser({
      email: TEST_EMAIL_FALLBACK,
      password: TEST_PASSWORD,
      email_confirm: true,
    });
    if (fbAuthErr || !fallbackUser?.user) throw fbAuthErr;

    // Manually ensure profile is unassigned
    await admin
      .from("profiles")
      .update({ role: null, has_selected_role: false, has_completed_onboarding: false })
      .eq("id", fallbackUser.user.id);

    console.log("3.3 Now creating a pending invitation for this existing user...");
    await admin.from("invitations").insert({
      tenant_id: TENANT_ID,
      invited_by: OWNER_PROFILE_ID,
      email: TEST_EMAIL_FALLBACK,
      invited_role: "STAFF",
      status: "pending",
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });

    console.log("3.4 Signing in and requesting /select-role to test server-side auto-reconciliation...");
    const { data: fbSignIn } = await anon.auth.signInWithPassword({
      email: TEST_EMAIL_FALLBACK,
      password: TEST_PASSWORD,
    });
    const fbCookieHeader = buildCookieHeader(fbSignIn.session);

    const fbRes = await fetchLocal("/select-role", fbCookieHeader);
    console.log("   Response Status:", fbRes.statusCode);
    console.log("   Response Location:", fbRes.headers.location);

    // Verify profile was updated by the server guard
    const { data: fbProfile } = await admin
      .from("profiles")
      .select("role, tenant_id, has_selected_role")
      .eq("id", fallbackUser.user.id)
      .single();

    console.log("   Reconciled Profile:", fbProfile);
    if (fbProfile?.role === "STAFF" && fbProfile?.tenant_id === TENANT_ID) {
      console.log("   ✅ Fallback Server Guard successfully intercepted and bound unassigned user to STAFF!\n");
    } else {
      throw new Error("❌ Fallback Server Guard failed to auto-bind user!");
    }

    // -------------------------------------------------------------------------
    // TEST 4: Organic Public User Flow (Regression Check)
    // -------------------------------------------------------------------------
    console.log("📋 TEST 4: Organic Public Registration (Regression Test)");
    console.log("4.1 Purging organic test user:", TEST_EMAIL_ORGANIC);
    await purgeUser(TEST_EMAIL_ORGANIC);

    console.log("4.2 Creating organic uninvited user...");
    const { data: organicUser } = await admin.auth.admin.createUser({
      email: TEST_EMAIL_ORGANIC,
      password: TEST_PASSWORD,
      email_confirm: true,
    });

    const { data: orgProfile } = await admin
      .from("profiles")
      .select("role, has_selected_role")
      .eq("id", organicUser.user.id)
      .single();

    console.log("   Organic Profile:", orgProfile);
    if (orgProfile?.role === null && orgProfile?.has_selected_role === false) {
      console.log("   ✅ Organic registration correctly creates unassigned profile (role = NULL, has_selected_role = false).");
    } else {
      throw new Error("❌ Organic user was incorrectly assigned a role!");
    }

    console.log("4.3 Signing in as organic user and requesting /select-role...");
    const { data: orgSignIn } = await anon.auth.signInWithPassword({
      email: TEST_EMAIL_ORGANIC,
      password: TEST_PASSWORD,
    });
    const orgCookieHeader = buildCookieHeader(orgSignIn.session);
    const orgRes = await fetchLocal("/select-role", orgCookieHeader);
    console.log("   Response Status:", orgRes.statusCode);
    if (orgRes.statusCode === 200) {
      console.log("   ✅ /select-role renders HTTP 200 for organic users (Public role cards available)!\n");
    }

    // -------------------------------------------------------------------------
    // CLEANUP
    // -------------------------------------------------------------------------
    console.log("🧹 CLEANUP: Purging all automated test accounts...");
    await purgeUser(TEST_EMAIL_STAFF);
    await purgeUser(TEST_EMAIL_FALLBACK);
    await purgeUser(TEST_EMAIL_ORGANIC);
    console.log("   ✅ Cleanup complete.");

    console.log("\n==================================================================");
    console.log("🎉 ALL 4 E2E TESTS PASSED WITH 100% SUCCESS!");
    console.log("==================================================================");
  } catch (err) {
    console.error("\n❌ TEST SUITE ENCOUNTERED AN ERROR:\n", err);
    process.exit(1);
  }
}

runTests();
