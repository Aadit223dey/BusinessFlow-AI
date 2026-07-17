import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/config/env";

/**
 * Application Entry Session Screening Layer
 *
 * Inspects active request cookies, checks session token expiration properties,
 * and routes traffic dynamically based on authentication status, roles, and
 * onboarding completion state.
 *
 * Sprint 3 additions:
 * - Authenticated users without completed onboarding are redirected to /onboarding
 * - Authenticated users WITH completed onboarding are blocked from /onboarding
 * - Auth page redirects now route to /onboarding for unconfigured users
 *
 * Completed under 100ms window limit to prevent routing delays.
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
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isOnboardingRoute = pathname.startsWith("/onboarding");
  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password");
  const isApiRoute = pathname.startsWith("/api/");

  // Skip middleware checks for API routes
  if (isApiRoute) {
    return response;
  }

  // ─── Unauthenticated Users ────────────────────────────────────
  if (!user) {
    // Block access to protected routes
    if (isDashboardRoute || isOnboardingRoute) {
      const redirectUrl = new URL("/login", request.url);
      return NextResponse.redirect(redirectUrl);
    }
    return response;
  }

  // ─── Authenticated Users ──────────────────────────────────────
  // Check onboarding completion status
  const { data: profile } = await supabase
    .from("profiles")
    .select("has_completed_onboarding")
    .eq("id", user.id)
    .single();

  const hasCompletedOnboarding = profile?.has_completed_onboarding === true;

  // Redirect authenticated users away from auth pages
  if (isAuthRoute) {
    if (hasCompletedOnboarding) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  // Users who haven't completed onboarding cannot access dashboard
  if (isDashboardRoute && !hasCompletedOnboarding) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  // Users who have completed onboarding cannot access onboarding again
  if (isOnboardingRoute && hasCompletedOnboarding) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images, icons or other assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
