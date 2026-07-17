import { createBrowserClient } from "@supabase/ssr";
import { type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/config/env";

/**
 * BaaS Type-Safe Interface Client
 *
 * Instantiates a singleton client configuration for managing connection pools
 * across the application. Realtime configuration limits connection channels
 * to a maximum payload window of 20 events per second.
 */

let supabaseInstance: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  supabaseInstance = createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 20,
        },
      },
      global: {
        headers: {
          "x-application-name": "businessflow-ai",
        },
      },
    }
  );

  return supabaseInstance;
}

/**
 * Pre-configured Supabase client singleton.
 *
 * Provides access to:
 * - `.auth` — Authentication operations
 * - `.from()` — Database table queries
 * - `.storage` — File storage operations
 * - `.channel()` — Realtime channel subscriptions
 *
 * @example
 * ```ts
 * import { supabase } from "@/lib/supabase";
 *
 * const { data } = await supabase.from("users").select("*");
 * ```
 */
export const supabase: SupabaseClient = getSupabaseClient();
