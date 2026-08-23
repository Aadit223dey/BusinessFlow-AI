"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  UserCheck,
  AlertTriangle,
  LogOut,
  Clock,
  Shield,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/toast";
import { useAuth } from "@/providers/auth-provider";
import { type StaffPermissionKey, type EmploymentStatus } from "@/types/staff";

interface StaffInfo {
  id: string;
  job_title: string;
  department: string;
  status: EmploymentStatus;
  hired_at: string;
  tenant_name?: string;
  permissions: StaffPermissionKey[];
}

export default function StaffPortalPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [staffInfo, setStaffInfo] = useState<StaffInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStaffData() {
      if (!user) return;
      setIsLoading(true);
      try {
        // 1. Fetch staff member record
        const { data: staffData, error: staffError } = await supabase
          .from("staff_members")
          .select(`
            id,
            job_title,
            department,
            status,
            hired_at,
            tenant_id
          `)
          .eq("profile_id", user.id)
          .maybeSingle();

        if (staffError) {
          console.error("Error fetching staff member:", staffError);
        }

        if (staffData) {
          // 2. Fetch permissions
          const { data: permData } = await supabase
            .from("staff_permissions")
            .select("permission_key")
            .eq("staff_id", staffData.id);

          // 3. Fetch tenant name
          const { data: tenantData } = await supabase
            .from("tenants")
            .select("name")
            .eq("id", staffData.tenant_id)
            .maybeSingle();

          setStaffInfo({
            id: staffData.id,
            job_title: staffData.job_title,
            department: staffData.department,
            status: staffData.status,
            hired_at: staffData.hired_at,
            tenant_name: tenantData?.name || "Business Workspace",
            permissions: (permData || []).map((p: any) => p.permission_key as StaffPermissionKey),
          });
        }
      } catch (err) {
        console.error("Failed to load staff portal data:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadStaffData();
  }, [user]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Signout error:", err);
      toast.error("Error signing out");
    } finally {
      setIsSigningOut(false);
    }
  };

  const isDeactivated = staffInfo?.status === "INACTIVE" || staffInfo?.status === "SUSPENDED";

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <header className="flex h-16 items-center justify-between px-6 sm:px-8 border-b border-border/60 bg-card/70 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500 border border-violet-500/20 font-bold text-sm">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-foreground">BusinessFlow AI</span>
              <span className="rounded-full bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 text-[10px] font-extrabold uppercase text-violet-500">
                Staff Workspace
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="gap-2 text-xs text-destructive hover:bg-destructive/10 border-destructive/20"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>{isSigningOut ? "Signing out..." : "Sign Out"}</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 sm:p-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading staff workspace...</p>
          </div>
        ) : isDeactivated ? (
          /* Deactivated Notice */
          <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-destructive/30 bg-card/80 p-8 sm:p-10 shadow-2xl backdrop-blur-xl text-center space-y-6 animate-fade-in">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive border border-destructive/20">
              <XCircle className="h-7 w-7" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                Account Deactivated
              </h1>
              <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                Your staff account status has been marked as <span className="font-semibold text-destructive">{staffInfo?.status}</span> by your employer.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-muted/40 p-4 text-xs text-muted-foreground text-left space-y-2">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span>Contact Business Administrator</span>
              </div>
              <p>
                To reactivate your workspace access, please contact your business administrator or employer directly.
              </p>
            </div>

            <Button
              variant="outline"
              size="default"
              className="w-full sm:w-auto text-muted-foreground gap-2"
              onClick={handleSignOut}
              disabled={isSigningOut}
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        ) : (
          /* Active Staff Workspace Card */
          <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-violet-500/20 bg-card/80 p-8 sm:p-10 shadow-2xl backdrop-blur-xl space-y-8 animate-fade-in">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />

            {/* Header / Identity */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white font-extrabold text-xl shadow-lg shadow-violet-500/20">
                  {profile?.first_name?.[0] || profile?.firstName?.[0] || "S"}
                  {profile?.last_name?.[0] || profile?.lastName?.[0] || "M"}
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-foreground">
                    {profile?.first_name || profile?.firstName || "Staff"}{" "}
                    {profile?.last_name || profile?.lastName || "Member"}
                  </h1>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                    <Building2 className="h-3.5 w-3.5" />
                    <span>{staffInfo?.tenant_name || "Workspace Member"}</span>
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 self-start sm:self-center">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Active Staff</span>
              </div>
            </div>

            {/* Staff Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-border bg-muted/30 p-4 space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Briefcase className="h-3.5 w-3.5 text-primary" />
                  <span>Job Title</span>
                </div>
                <p className="text-sm font-bold text-foreground">
                  {staffInfo?.job_title || "Staff Member"}
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-muted/30 p-4 space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Building2 className="h-3.5 w-3.5 text-primary" />
                  <span>Department</span>
                </div>
                <p className="text-sm font-bold text-foreground">
                  {staffInfo?.department || "General"}
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-muted/30 p-4 space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  <span>Member Since</span>
                </div>
                <p className="text-sm font-bold text-foreground">
                  {staffInfo?.hired_at
                    ? new Date(staffInfo.hired_at).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "Active"}
                </p>
              </div>
            </div>

            {/* Access Permissions Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-violet-500" />
                <h3 className="text-sm font-bold text-foreground">
                  Assigned Operational Permissions
                </h3>
              </div>

              {staffInfo?.permissions && staffInfo.permissions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {staffInfo.permissions.map((perm) => (
                    <span
                      key={perm}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-600 dark:text-violet-400"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      {perm.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-muted/20 p-4 text-xs text-muted-foreground">
                  No specific operational permissions granted yet. Contact your business administrator to configure permissions.
                </div>
              )}
            </div>

            {/* Operational Modules Notice */}
            <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4 space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <Clock className="h-4 w-4 text-violet-500" />
                <span>Operational Module Delegation</span>
              </div>
              <p className="leading-relaxed">
                As your business owner assigns calendar, customer, and service tasks, your daily shift schedule and operational queues will sync directly into this portal.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
