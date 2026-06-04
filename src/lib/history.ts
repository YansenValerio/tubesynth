import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { isConfigured } from "@/lib/env";

export interface SummaryListItem {
  id: string;
  youtubeId: string;
  title: string;
  channelName: string;
  durationSeconds: number;
  thumbnailUrl: string;
  completedAt: string | null;
  isFavorite: boolean;
  folderId: string | null;
}

/** A signed-in user's completed summaries, newest first. */
export async function getUserSummaries(
  userId: string,
): Promise<SummaryListItem[]> {
  if (!isConfigured()) return [];
  try {
    const db = createSupabaseAdminClient();
    const { data: summaries } = await db
      .from("summaries")
      .select("id, video_id, completed_at, is_favorite, folder_id")
      .eq("user_id", userId)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(100);

    if (!summaries || summaries.length === 0) return [];

    const videoIds = [
      ...new Set(summaries.map((s) => s.video_id).filter(Boolean)),
    ] as string[];

    const { data: videos } = await db
      .from("videos")
      .select("id, youtube_id, title, channel_name, duration_seconds, thumbnail_url")
      .in("id", videoIds);

    const byId = new Map((videos ?? []).map((v) => [v.id, v]));

    return summaries
      .map((s) => {
        const v = s.video_id ? byId.get(s.video_id) : undefined;
        if (!v) return null;
        return {
          id: s.id,
          youtubeId: v.youtube_id,
          title: v.title,
          channelName: v.channel_name ?? "",
          durationSeconds: v.duration_seconds,
          thumbnailUrl: v.thumbnail_url ?? "",
          completedAt: s.completed_at,
          isFavorite: s.is_favorite ?? false,
          folderId: s.folder_id ?? null,
        } satisfies SummaryListItem;
      })
      .filter((x): x is SummaryListItem => x !== null);
  } catch {
    return [];
  }
}
