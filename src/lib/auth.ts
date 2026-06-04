import "server-only";

import type { User } from "@supabase/supabase-js";
import { isConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/ssr";

/** Current signed-in user, or null (also null when auth isn't configured). */
export async function getCurrentUser(): Promise<User | null> {
  if (!isConfigured()) return null;
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

/** A friendly display name for a user (first name, else email handle). */
export function displayName(user: User): string {
  const full =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined);
  if (full) return full.split(" ")[0];
  return user.email?.split("@")[0] ?? "there";
}
