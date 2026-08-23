import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let adminClient: SupabaseClient | null = null;

/**
 * Returns a singleton instance of the privileged Supabase Admin client.
 * Returns null if SUPABASE_SERVICE_ROLE_KEY is not configured in the environment.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  if (!adminClient) {
    adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return adminClient;
}

/**
 * Lazy proxy export for backwards compatibility with direct `supabaseAdmin` calls.
 */
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseAdmin();
    if (!client) {
      throw new Error(
        "Supabase Admin client cannot be initialized: Missing SUPABASE_SERVICE_ROLE_KEY environment variable."
      );
    }
    return (client as any)[prop];
  },
});
