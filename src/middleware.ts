import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/config/env";
import { SUPER_ADMIN_EMAIL } from "@/config/admin";

/**
 * 4-Role Identity & Flow Restructuring Middleware
 *
 * Evaluates session JWT tokens, user email, profile roles (SUPER_ADMIN, BUSINESS_OWNER, STAFF, CUSTOMER),
 * role selection flags (has_selected_role), and onboarding status (has_completed_onboarding)
 * to enforce strict server-side portal boundary protection.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Skip middleware checks for API routes
  if (pathname.startsWith("/api/")) {
    return response;
  }

  const isProtectedPath =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/customers") ||
    pathname.startsWith("/employees") ||
    pathname.startsWith("/services") ||
    pathname.startsWith("/appointments") ||
    pathname.startsWith("/calendar") ||
    pathname.startsWith("/invoices") ||
    pathname.startsWith("/inventory") ||
    pathname.startsWith("/reports") ||
    pathname.startsWith("/ai-insights") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/select-role") ||
    pathname.startsWith("/customer-portal") ||
    pathname.startsWith("/staff-portal") ||
    pathname.startsWith("/admin-portal");

  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password");

  // ─── 1. Unauthenticated Traffic ──────────────────────────────────────────
  if (!user) {
    if (isProtectedPath) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return response;
  }

  // ─── 2. Super Admin Check (Email or Role) ───────────────────────────────
  const isSuperAdminEmail =
    user.email && user.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

  // Retrieve user profile data
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, has_selected_role, has_completed_onboarding")
    .eq("id", user.id)
    .single();

  const role = isSuperAdminEmail ? "SUPER_ADMIN" : profile?.role;
  const hasSelectedRole = isSuperAdminEmail ? true : profile?.has_selected_role === true;
  const hasCompletedOnboarding = isSuperAdminEmail ? true : profile?.has_completed_onboarding === true;

  // ─── Path A: Super Admin ─────────────────────────────────────────────────
  if (role === "SUPER_ADMIN") {
    if (!pathname.startsWith("/admin-portal")) {
      return NextResponse.redirect(new URL("/admin-portal", request.url));
    }
    return response;
  }

  // ─── Path B: Unselected Role ─────────────────────────────────────────────
  if (!hasSelectedRole) {
    if (!pathname.startsWith("/select-role")) {
      return NextResponse.redirect(new URL("/select-role", request.url));
    }
    return response;
  }

  // ─── Path C: Business Owner ──────────────────────────────────────────────
  if (role === "BUSINESS_OWNER") {
    if (!hasCompletedOnboarding) {
      if (!pathname.startsWith("/onboarding")) {
        return NextResponse.redirect(new URL("/onboarding", request.url));
      }
      return response;
    } else {
      // Completed Onboarding -> must stay in /dashboard or sub-routes
      if (
        isAuthRoute ||
        pathname.startsWith("/select-role") ||
        pathname.startsWith("/onboarding") ||
        pathname.startsWith("/customer-portal") ||
        pathname.startsWith("/staff-portal") ||
        pathname.startsWith("/admin-portal")
      ) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      return response;
    }
  }

  // ─── Path D: Customer ───────────────────────────────────────────────────
  if (role === "CUSTOMER") {
    if (!pathname.startsWith("/customer-portal")) {
      return NextResponse.redirect(new URL("/customer-portal", request.url));
    }
    return response;
  }

  // ─── Path E: Staff / Employee ────────────────────────────────────────────
  if (role === "STAFF") {
    if (!pathname.startsWith("/staff-portal")) {
      return NextResponse.redirect(new URL("/staff-portal", request.url));
    }
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static files & assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
