import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { env } from '@/config/env';
import { CustomerShell } from '@/components/navigation/CustomerShell';

export const dynamic = 'force-dynamic';

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  console.log("🔍 [DIAGNOSTIC 1/7] Route Entered: /customer/*", { timestamp: Date.now() });

  const cookieStore = await cookies();
  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch { /* Server Component ignore */ }
        },
      },
    }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  console.log("🔍 [DIAGNOSTIC 2/7] Auth Session Hydrated:", {
    hasUser: !!user,
    userId: user?.id,
    authError: authError?.message ?? null,
  });

  // Only redirect unauthenticated traffic to /login
  if (authError || !user) { 
    redirect('/login'); 
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, role, tenant_id, avatar_url, has_selected_role')
    .eq('id', user.id)
    .single();

  console.log("🔍 [DIAGNOSTIC 3/7] Profile Loaded:", {
    role: profile?.role ?? "NULL",
    hasSelectedRole: profile?.has_selected_role ?? false,
    tenantId: profile?.tenant_id ?? "NULL (Valid for Customer)",
    firstName: profile?.first_name,
  });

  // Handle role routing explicitly - NEVER send authenticated users to /login to avoid 307 loops with middleware
  if (!profile || !profile.has_selected_role) {
    redirect('/select-role');
  }

  if (profile.role === 'BUSINESS_OWNER') {
    redirect('/dashboard');
  } else if (profile.role === 'STAFF') {
    redirect('/staff-portal');
  } else if (profile.role === 'SUPER_ADMIN') {
    redirect('/admin-portal');
  } else if (profile.role !== 'CUSTOMER') {
    redirect('/select-role');
  }

  const userName = profile.first_name || profile.last_name
    ? `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim()
    : user.email?.split('@')[0] || 'Customer';

  return (
    <CustomerShell
      userName={userName}
      userEmail={user.email || ''}
      avatarUrl={profile.avatar_url ?? null}
    >
      {children}
    </CustomerShell>
  );
}
