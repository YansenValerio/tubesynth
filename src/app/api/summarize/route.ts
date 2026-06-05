import { NextResponse, type NextRequest } from "next/server";
import { extractYouTubeId } from "@/lib/youtube";
import { isConfigured } from "@/lib/env";
import { fetchVideoMetadata, MetadataError } from "@/lib/metadata";
import {
  fetchTranscript,
  transcriptDuration,
  TranscriptError,
} from "@/lib/transcript";
import { tasks } from "@trigger.dev/sdk";
import { summarize, chooseStrategy } from "@/lib/summarize";
import {
  backgroundEnabled,
  createPendingSummary,
  getCachedSummary,
  persistSummary,
} from "@/lib/cache";
import { getAnonRateLimiter } from "@/lib/redis";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const maxDuration = 300; // allow long single-pass / chunked runs

const MAX_DURATION_SECONDS = 12 * 3600;

export async function POST(req: NextRequest) {
  let body: { url?: string; youtubeId?: string; language?: string };
  try {
    body = await req.json();
  } catch {
    return error("Invalid request body.", "BAD_REQUEST", 400);
  }

  const youtubeId = extractYouTubeId(body.youtubeId ?? body.url ?? "");
  if (!youtubeId) {
    return error("That doesn't look like a YouTube link.", "INVALID_URL", 400);
  }
  const language = body.language?.trim() || "en";

  // Gemini is required to produce a real summary.
  if (!process.env.GEMINI_API_KEY) {
    return error(
      "Summarization isn't configured yet. Add GEMINI_API_KEY to enable it.",
      "NOT_CONFIGURED",
      501,
    );
  }

  // Rate limiting (best-effort; skipped when Upstash isn't configured).
  if (process.env.UPSTASH_REDIS_REST_URL) {
    try {
      const ip = clientIp(req);
      const { success, reset } = await getAnonRateLimiter().limit(ip);
      if (!success) {
        return NextResponse.json(
          {
            ok: false,
            code: "RATE_LIMITED",
            error: "Hourly limit reached. Try again later.",
            retryAfter: reset,
          },
          { status: 429 },
        );
      }
    } catch {
      // ignore limiter failures
    }
  }

  // Cache hit → return instantly.
  const cached = await getCachedSummary(youtubeId, language);
  if (cached) {
    return NextResponse.json({
      ok: true,
      mode: "inline",
      cached: true,
      ...cached,
    });
  }

  const userId = (await getCurrentUser())?.id ?? null;
  const started = Date.now();
  try {
    const meta = await fetchVideoMetadata(youtubeId);
    const segments = await fetchTranscript(youtubeId, language);
    meta.durationSeconds = transcriptDuration(segments);

    if (meta.durationSeconds > MAX_DURATION_SECONDS) {
      return error(
        "This video is longer than 12 hours, which we can't process yet.",
        "TOO_LONG",
        413,
      );
    }

    // Long videos (chunked/hierarchical) → background job when Trigger.dev is
    // configured. Short videos stay inline so they're instant and need no
    // worker running. The task re-fetches the transcript itself.
    if (chooseStrategy(meta.durationSeconds) !== "single" && backgroundEnabled()) {
      try {
        const summaryId = await createPendingSummary(meta, language, userId);
        if (summaryId) {
          await tasks.trigger("summarize-video", {
            summaryId,
            youtubeId,
            language,
          });
          return NextResponse.json({
            ok: true,
            mode: "job",
            summaryId,
            metadata: meta,
          });
        }
      } catch (err) {
        // Fall through to inline processing if enqueue fails.
        console.error("background enqueue failed, running inline:", err);
      }
    }

    const { content, strategy } = await summarize(meta, segments, language);

    await persistSummary(
      meta,
      content,
      strategy,
      language,
      {
        tokensInput: 0,
        tokensOutput: 0,
        processingMs: Date.now() - started,
      },
      userId,
    );

    return NextResponse.json({
      ok: true,
      mode: "inline",
      cached: false,
      strategy,
      metadata: meta,
      content,
    });
  } catch (err) {
    if (err instanceof TranscriptError) {
      return error(err.message, err.code, 422);
    }
    if (err instanceof MetadataError) {
      return error(err.message, "METADATA_ERROR", 422);
    }
    console.error("summarize failed:", err);
    return error(
      "Something went wrong while summarizing. Please try again.",
      "INTERNAL_ERROR",
      500,
    );
  }
}

function error(message: string, code: string, status: number) {
  return NextResponse.json({ ok: false, code, error: message }, { status });
}

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "anonymous";
}

// Tell clients whether real summarization is available (used by the UI to
// decide between the live pipeline and the sample fallback).
export async function GET() {
  return NextResponse.json({
    configured: Boolean(process.env.GEMINI_API_KEY),
    cacheEnabled: isConfigured(),
  });
}
