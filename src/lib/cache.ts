import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { isConfigured } from "@/lib/env";
import type {
  SummaryContent,
  SummaryStatus,
  SummaryStrategy,
  VideoMetadata,
} from "@/lib/types";

/** True when both Supabase and Trigger.dev are configured (background path). */
export function backgroundEnabled(): boolean {
  return isConfigured() && Boolean(process.env.TRIGGER_SECRET_KEY);
}

/**
 * Best-effort summary cache backed by Supabase. Every function is guarded so
 * that a missing/broken DB never breaks the summarization request — it just
 * means a cache miss (PRD §F5).
 */

export async function getCachedSummary(
  youtubeId: string,
  language: string,
): Promise<{ metadata: VideoMetadata; content: SummaryContent } | null> {
  if (!isConfigured()) return null;
  try {
    const db = createSupabaseAdminClient();
    const { data: video } = await db
      .from("videos")
      .select("*")
      .eq("youtube_id", youtubeId)
      .maybeSingle();
    if (!video) return null;

    const { data: summary } = await db
      .from("summaries")
      .select("content")
      .eq("video_id", video.id)
      .eq("language", language)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!summary?.content) return null;

    return {
      metadata: {
        youtubeId: video.youtube_id,
        title: video.title,
        channelName: video.channel_name ?? "",
        durationSeconds: video.duration_seconds,
        thumbnailUrl: video.thumbnail_url ?? "",
        language: video.language ?? language,
      },
      content: summary.content,
    };
  } catch {
    return null;
  }
}

export async function persistSummary(
  meta: VideoMetadata,
  content: SummaryContent,
  strategy: SummaryStrategy,
  language: string,
  usage: { tokensInput: number; tokensOutput: number; processingMs: number },
  userId: string | null = null,
): Promise<void> {
  if (!isConfigured()) return;
  try {
    const db = createSupabaseAdminClient();
    const { data: video } = await db
      .from("videos")
      .upsert(
        {
          youtube_id: meta.youtubeId,
          title: meta.title,
          channel_name: meta.channelName,
          duration_seconds: meta.durationSeconds,
          thumbnail_url: meta.thumbnailUrl,
          language: meta.language ?? language,
          fetched_at: new Date().toISOString(),
        },
        { onConflict: "youtube_id" },
      )
      .select("id")
      .single();

    if (!video) return;

    await db.from("summaries").insert({
      video_id: video.id,
      user_id: userId,
      language,
      strategy,
      status: "completed",
      progress: 100,
      content,
      model_used: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
      tokens_input: usage.tokensInput,
      tokens_output: usage.tokensOutput,
      processing_time_ms: usage.processingMs,
      completed_at: new Date().toISOString(),
    });
  } catch {
    // Best effort — ignore persistence failures.
  }
}

/** Upsert the video and create a processing summary row; returns its id. */
export async function createPendingSummary(
  meta: Pick<VideoMetadata, "youtubeId" | "title" | "channelName" | "thumbnailUrl"> &
    Partial<Pick<VideoMetadata, "durationSeconds" | "language">>,
  language: string,
  userId: string | null = null,
): Promise<string | null> {
  if (!isConfigured()) return null;
  const db = createSupabaseAdminClient();
  const { data: video } = await db
    .from("videos")
    .upsert(
      {
        youtube_id: meta.youtubeId,
        title: meta.title,
        channel_name: meta.channelName,
        duration_seconds: meta.durationSeconds ?? 0,
        thumbnail_url: meta.thumbnailUrl,
        language: meta.language ?? language,
        fetched_at: new Date().toISOString(),
      },
      { onConflict: "youtube_id" },
    )
    .select("id")
    .single();
  if (!video) return null;

  const { data: summary } = await db
    .from("summaries")
    .insert({
      video_id: video.id,
      user_id: userId,
      language,
      status: "processing",
      progress: 0,
      current_step: "Queued",
    })
    .select("id")
    .single();

  return summary?.id ?? null;
}

export async function updateSummaryProgress(
  summaryId: string,
  progress: number,
  step: string,
): Promise<void> {
  try {
    const db = createSupabaseAdminClient();
    await db
      .from("summaries")
      .update({ progress, current_step: step })
      .eq("id", summaryId);
  } catch {
    /* ignore */
  }
}

export async function completeSummary(
  summaryId: string,
  meta: VideoMetadata,
  content: SummaryContent,
  strategy: SummaryStrategy,
  usage: { processingMs: number },
): Promise<void> {
  const db = createSupabaseAdminClient();
  // Keep the video's real duration (discovered during processing) in sync.
  await db
    .from("videos")
    .update({ duration_seconds: meta.durationSeconds })
    .eq("youtube_id", meta.youtubeId);
  await db
    .from("summaries")
    .update({
      status: "completed",
      progress: 100,
      current_step: "Done",
      content,
      strategy,
      model_used: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
      processing_time_ms: usage.processingMs,
      completed_at: new Date().toISOString(),
    })
    .eq("id", summaryId);
}

export async function failSummary(
  summaryId: string,
  message: string,
): Promise<void> {
  try {
    const db = createSupabaseAdminClient();
    await db
      .from("summaries")
      .update({ status: "failed", error_message: message })
      .eq("id", summaryId);
  } catch {
    /* ignore */
  }
}

export interface SummaryStatusResult {
  status: SummaryStatus;
  progress: number;
  currentStep: string | null;
  errorMessage: string | null;
  metadata: VideoMetadata | null;
  content: SummaryContent | null;
}

/** Toggle the favorite flag on a user's own summary. Returns success. */
export async function setFavorite(
  summaryId: string,
  userId: string,
  value: boolean,
): Promise<boolean> {
  if (!isConfigured()) return false;
  try {
    const db = createSupabaseAdminClient();
    const { error, count } = await db
      .from("summaries")
      .update({ is_favorite: value }, { count: "exact" })
      .eq("id", summaryId)
      .eq("user_id", userId);
    return !error && (count ?? 0) > 0;
  } catch {
    return false;
  }
}

/** Generate a short, URL-safe share slug. */
function makeSlug(): string {
  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let slug = "";
  for (let i = 0; i < 10; i++) {
    slug += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return slug;
}

/**
 * Make a video's completed summary public and return its share slug.
 * Returns null when not configured or the summary doesn't exist yet.
 */
export async function makeSummaryPublic(
  youtubeId: string,
  language: string,
): Promise<string | null> {
  if (!isConfigured()) return null;
  try {
    const db = createSupabaseAdminClient();
    const { data: video } = await db
      .from("videos")
      .select("id")
      .eq("youtube_id", youtubeId)
      .maybeSingle();
    if (!video) return null;

    const { data: summary } = await db
      .from("summaries")
      .select("id, share_slug")
      .eq("video_id", video.id)
      .eq("language", language)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!summary) return null;

    if (summary.share_slug) {
      await db
        .from("summaries")
        .update({ is_public: true })
        .eq("id", summary.id);
      return summary.share_slug;
    }

    const slug = makeSlug();
    await db
      .from("summaries")
      .update({ is_public: true, share_slug: slug })
      .eq("id", summary.id);
    return slug;
  } catch {
    return null;
  }
}

export async function getPublicSummaryBySlug(
  slug: string,
): Promise<{ metadata: VideoMetadata; content: SummaryContent } | null> {
  if (!isConfigured()) return null;
  try {
    const db = createSupabaseAdminClient();
    const { data: summary } = await db
      .from("summaries")
      .select("content, video_id")
      .eq("share_slug", slug)
      .eq("is_public", true)
      .eq("status", "completed")
      .maybeSingle();
    if (!summary?.content || !summary.video_id) return null;

    const { data: v } = await db
      .from("videos")
      .select("*")
      .eq("id", summary.video_id)
      .maybeSingle();
    if (!v) return null;

    return {
      metadata: {
        youtubeId: v.youtube_id,
        title: v.title,
        channelName: v.channel_name ?? "",
        durationSeconds: v.duration_seconds,
        thumbnailUrl: v.thumbnail_url ?? "",
        language: v.language ?? "en",
      },
      content: summary.content,
    };
  } catch {
    return null;
  }
}

export async function getSummaryStatus(
  summaryId: string,
): Promise<SummaryStatusResult | null> {
  if (!isConfigured()) return null;
  try {
    const db = createSupabaseAdminClient();
    const { data: s } = await db
      .from("summaries")
      .select("status, progress, current_step, error_message, content, video_id")
      .eq("id", summaryId)
      .maybeSingle();
    if (!s) return null;

    let metadata: VideoMetadata | null = null;
    if (s.video_id) {
      const { data: v } = await db
        .from("videos")
        .select("*")
        .eq("id", s.video_id)
        .maybeSingle();
      if (v) {
        metadata = {
          youtubeId: v.youtube_id,
          title: v.title,
          channelName: v.channel_name ?? "",
          durationSeconds: v.duration_seconds,
          thumbnailUrl: v.thumbnail_url ?? "",
          language: v.language ?? "en",
        };
      }
    }

    return {
      status: s.status as SummaryStatus,
      progress: s.progress,
      currentStep: s.current_step,
      errorMessage: s.error_message,
      metadata,
      content: s.content,
    };
  } catch {
    return null;
  }
}
