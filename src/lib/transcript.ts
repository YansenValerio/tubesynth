// Server-side only. Shared by Next routes and the Trigger.dev worker, so no
// `server-only` guard (it doesn't resolve in the Trigger esbuild bundler).
import { YoutubeTranscript } from "youtube-transcript";
import type { TranscriptSegment } from "@/lib/types";

export class TranscriptError extends Error {
  code: "NO_TRANSCRIPT_AVAILABLE" | "FETCH_FAILED";
  constructor(
    code: "NO_TRANSCRIPT_AVAILABLE" | "FETCH_FAILED",
    message: string,
  ) {
    super(message);
    this.name = "TranscriptError";
    this.code = code;
  }
}

/**
 * Fetch a video's transcript. Prefers the requested language, falling back to
 * whatever YouTube provides. Throws TranscriptError with a clear code when
 * no transcript exists (the common failure mode — PRD §6.2 / §F2.5).
 */
export async function fetchTranscript(
  youtubeId: string,
  language?: string,
): Promise<TranscriptSegment[]> {
  try {
    const raw = await YoutubeTranscript.fetchTranscript(youtubeId, {
      lang: language,
    });

    if (!raw || raw.length === 0) {
      throw new TranscriptError(
        "NO_TRANSCRIPT_AVAILABLE",
        "This video doesn't have a transcript or captions available.",
      );
    }

    // youtube-transcript returns offset/duration in milliseconds.
    return raw.map((seg) => ({
      text: decodeHtmlEntities(seg.text),
      start: seg.offset / 1000,
      duration: seg.duration / 1000,
    }));
  } catch (err) {
    if (err instanceof TranscriptError) throw err;

    const message = err instanceof Error ? err.message : String(err);
    if (/disabled|not available|could not find|no transcript/i.test(message)) {
      throw new TranscriptError(
        "NO_TRANSCRIPT_AVAILABLE",
        "This video doesn't have a transcript or captions available.",
      );
    }
    throw new TranscriptError(
      "FETCH_FAILED",
      "We couldn't fetch the transcript. Try again in a moment.",
    );
  }
}

/** End time (seconds) of the transcript — used as a duration estimate. */
export function transcriptDuration(segments: TranscriptSegment[]): number {
  if (segments.length === 0) return 0;
  const last = segments[segments.length - 1];
  return Math.ceil(last.start + last.duration);
}

/** Total word count across a transcript. */
export function transcriptWordCount(segments: TranscriptSegment[]): number {
  return segments.reduce(
    (sum, s) => sum + s.text.split(/\s+/).filter(Boolean).length,
    0,
  );
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;#39;|&#39;/g, "'")
    .replace(/&amp;quot;|&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}
