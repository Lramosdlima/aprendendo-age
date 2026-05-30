import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseEnv } from "@/lib/supabase/env";

let browserClient: SupabaseClient | undefined;
let publicClient: SupabaseClient | undefined;

export function createSupabaseClient(): SupabaseClient | null {
  const env = getSupabaseEnv();
  if (!env) return null;
  if (browserClient) return browserClient;
  browserClient = createClient(env.url, env.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return browserClient;
}

/** Cliente sem sessão — leituras públicas (ex.: Corrida AoM) sem esperar auth. */
export function createSupabasePublicClient(): SupabaseClient | null {
  const env = getSupabaseEnv();
  if (!env) return null;
  if (publicClient) return publicClient;
  publicClient = createClient(env.url, env.anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  return publicClient;
}
