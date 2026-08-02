import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { env } from '@/config/env';
import { CustomerSidebar } from '@/components/navigation/CustomerSidebar';
import { CustomerTopNav } from '@/components/navigation/CustomerTopNav';
import { CustomerLayoutContainer } from '@/components/navigation/CustomerLayoutContainer';

export const dynamic = 'force-dynamic';

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  console.log("🔍 [DIAGNOSTIC] Customer Layout: Shell Rendered", { timestamp: Date.now() });

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
  if (authError || !user) { redirect('/login'); }

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, role, tenant_id, avatar_url')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'CUSTOMER') {
    redirect('/login');
  }

  const userName = profile?.first_name || profile?.last_name
    ? `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim()
    : user.email?.split('@')[0] || 'Customer';

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/80 text-foreground transition-colors duration-300">
      <CustomerSidebar />
      <CustomerTopNav
        userName={userName}
        userEmail={user.email}
        avatarUrl={profile?.avatar_url}
      />
      <CustomerLayoutContainer>{children}</CustomerLayoutContainer>
    </div>
  );
}
