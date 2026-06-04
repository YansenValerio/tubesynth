import "server-only";

/**
 * Server-side Supabase client using the service-role key.
 * Bypasses RLS — never expose to the browser. Use in Server Actions,
 * Route Handlers, and background jobs only.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import type { Database } from "./types";

export function createSupabaseAdminClient(): SupabaseClient<Database> {
  return createClient<Database>(
    env.supabase.url,
    env.supabase.serviceRoleKey,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}
