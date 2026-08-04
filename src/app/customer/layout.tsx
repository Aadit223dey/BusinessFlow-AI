import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { env } from '@/config/env';
import { transformProfile } from '@/lib/transformers/profile-transformer';
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

  if (authError || !user) { 
    redirect('/login'); 
  }

  const { data: rawProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const profile = transformProfile(rawProfile);

  console.log("🔍 [PROFILE TRACE 5/6] Route Guard Validating Profile:", {
    path: "/customer/*",
    role: profile?.role,
    firstName: profile?.firstName,
    isAllowed: profile?.role === 'CUSTOMER',
  });

  if (!profile || !(profile.hasSelectedRole ?? profile.has_selected_role)) {
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

  console.log("🔍 [PROFILE TRACE 6/6] Customer Layout Mounting with Profile:", profile);

  const displayName = [profile.firstName || profile.first_name, profile.lastName || profile.last_name]
    .filter(Boolean)
    .join(" ") || user.email?.split('@')[0] || "Customer";

  return (
    <CustomerShell
      userName={displayName}
      userEmail={user.email || ''}
      avatarUrl={profile.avatarUrl ?? profile.avatar_url ?? null}
    >
      {children}
    </CustomerShell>
  );
}
