import { Suspense } from "react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "@/config/env";
import { Sparkles, Calendar as CalendarIcon, Building2 } from "lucide-react";
import { KpiGrid } from "@/features/dashboard/components/KpiGrid";
import { QuickActions } from "@/features/dashboard/components/QuickActions";
import { ScheduleTimeline } from "@/features/dashboard/components/ScheduleTimeline";
import { RecentActivityFeed } from "@/features/dashboard/components/RecentActivityFeed";
import { RevenueChart } from "@/features/dashboard/components/RevenueChart";
import { AiInsightsZone } from "@/features/dashboard/components/AiInsightsZone";
import { SkeletonLoader } from "@/components/shared/skeleton-loader";

export const dynamic = "force-dynamic";

/**
 * Primary Business Management Cockpit Canvas (Page Route /dashboard)
 *
 * Pre-fetches profile & tenant data on the server to hydrate personalized greeting
 * banner, and renders KPI matrix, quick operational action drawers, schedule timeline,
 * analytical charts, and AI insights.
 */
export default async function DashboardPage() {
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
            // Ignore in server component
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Retrieve authenticated profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, role, tenant_id")
    .eq("id", user.id)
    .single();

  // Retrieve tenant name
  let tenantName = "My Business Workspace";
  if (profile?.tenant_id) {
    const { data: tenant } = await supabase
      .from("tenants")
      .select("name")
      .eq("id", profile.tenant_id)
      .single();
    if (tenant?.name) {
      tenantName = tenant.name;
    }
  }

  const firstName = profile?.first_name || user.email?.split("@")[0] || "Leader";

  // Formatted date string
  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* ─── Personalized Welcome Banner ─────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-r from-brand-primary/15 via-primary/5 to-transparent p-6 sm:p-8 shadow-sm backdrop-blur-md">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-primary/10 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/60 px-3 py-1 text-xs font-semibold text-primary backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Cockpit Active</span>
              <span className="h-1 w-1 rounded-full bg-primary" />
              <Building2 className="h-3 w-3" />
              <span className="font-bold text-foreground truncate max-w-[180px]">{tenantName}</span>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              Welcome back, <span className="bg-gradient-to-r from-primary via-indigo-500 to-brand-electric bg-clip-text text-transparent">{firstName}</span>! 👋
            </h1>

            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
              Here is your real-time operational overview for <strong className="text-foreground">{tenantName}</strong>. All systems and schedules are functioning nominally.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-card/80 px-4 py-2.5 shadow-xs shrink-0 self-start md:self-auto">
            <CalendarIcon className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold text-foreground">{formattedDate}</span>
          </div>
        </div>
      </div>

      {/* ─── 6 KPI Indicator Cards ────────────────────────────────────────── */}
      <Suspense
        fallback={
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonLoader key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        }
      >
        <KpiGrid />
      </Suspense>

      {/* ─── Quick Actions Shortcut Bar ──────────────────────────────────── */}
      <QuickActions />

      {/* ─── Main Cockpit Canvas Split Grid (Timeline & Analytics) ──────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column (7 cols): Revenue Chart + Schedule Timeline */}
        <div className="space-y-6 lg:col-span-7">
          <Suspense fallback={<SkeletonLoader className="h-80 rounded-2xl" />}>
            <RevenueChart />
          </Suspense>

          <Suspense fallback={<SkeletonLoader className="h-96 rounded-2xl" />}>
            <ScheduleTimeline />
          </Suspense>
        </div>

        {/* Right Column (5 cols): Activity Feed + AI Insights */}
        <div className="space-y-6 lg:col-span-5">
          <Suspense fallback={<SkeletonLoader className="h-64 rounded-2xl" />}>
            <RecentActivityFeed />
          </Suspense>

          <Suspense fallback={<SkeletonLoader className="h-96 rounded-2xl" />}>
            <AiInsightsZone />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
