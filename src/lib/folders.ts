import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { isConfigured } from "@/lib/env";

export interface Folder {
  id: string;
  name: string;
  count: number;
}

/** A user's folders with the number of summaries in each. */
export async function getUserFolders(userId: string): Promise<Folder[]> {
  if (!isConfigured()) return [];
  try {
    const db = createSupabaseAdminClient();
    const { data: folders } = await db
      .from("folders")
      .select("id, name")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });
    if (!folders || folders.length === 0) return [];

    const { data: summaries } = await db
      .from("summaries")
      .select("folder_id")
      .eq("user_id", userId)
      .not("folder_id", "is", null);

    const counts = new Map<string, number>();
    for (const s of summaries ?? []) {
      if (s.folder_id) counts.set(s.folder_id, (counts.get(s.folder_id) ?? 0) + 1);
    }

    return folders.map((f) => ({
      id: f.id,
      name: f.name,
      count: counts.get(f.id) ?? 0,
    }));
  } catch {
    return [];
  }
}

export async function createFolder(
  userId: string,
  name: string,
): Promise<Folder | null> {
  if (!isConfigured()) return null;
  try {
    const db = createSupabaseAdminClient();
    const { data } = await db
      .from("folders")
      .insert({ user_id: userId, name: name.trim().slice(0, 60) })
      .select("id, name")
      .single();
    return data ? { id: data.id, name: data.name, count: 0 } : null;
  } catch {
    return null;
  }
}

export async function deleteFolder(
  userId: string,
  folderId: string,
): Promise<boolean> {
  if (!isConfigured()) return false;
  try {
    const db = createSupabaseAdminClient();
    const { error } = await db
      .from("folders")
      .delete()
      .eq("id", folderId)
      .eq("user_id", userId);
    return !error;
  } catch {
    return false;
  }
}

/** Move a summary into a folder (or out, with folderId = null). */
export async function assignSummaryToFolder(
  userId: string,
  summaryId: string,
  folderId: string | null,
): Promise<boolean> {
  if (!isConfigured()) return false;
  try {
    const db = createSupabaseAdminClient();

    // Verify the folder belongs to the user before assigning.
    if (folderId) {
      const { data: folder } = await db
        .from("folders")
        .select("id")
        .eq("id", folderId)
        .eq("user_id", userId)
        .maybeSingle();
      if (!folder) return false;
    }

    const { error, count } = await db
      .from("summaries")
      .update({ folder_id: folderId }, { count: "exact" })
      .eq("id", summaryId)
      .eq("user_id", userId);
    return !error && (count ?? 0) > 0;
  } catch {
    return false;
  }
}
