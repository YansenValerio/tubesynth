/**
 * Browser-side Supabase client (uses the public anon key, respects RLS).
 * Import from client components only.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import type { Database } from "./types";

let browserClient: SupabaseClient<Database> | null = null;

export function getSupabaseBrowserClient(): SupabaseClient<Database> {
  if (browserClient) return browserClient;
  browserClient = createClient<Database>(env.supabase.url, env.supabase.anonKey);
  return browserClient;
}
