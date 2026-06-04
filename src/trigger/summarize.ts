import { task } from "@trigger.dev/sdk";
import { fetchVideoMetadata } from "@/lib/metadata";
import { fetchTranscript, transcriptDuration } from "@/lib/transcript";
import { summarize } from "@/lib/summarize";
import {
  completeSummary,
  failSummary,
  updateSummaryProgress,
} from "@/lib/cache";

export interface SummarizePayload {
  summaryId: string;
  youtubeId: string;
  language?: string;
}

const MAX_DURATION_SECONDS = 12 * 3600;

/**
 * Background summarization (PRD §8.4). Progress is written to the summary row
 * in Supabase, which the client polls via /api/summarize/status.
 */
export const summarizeVideoTask = task({
  id: "summarize-video",
  maxDuration: 900,
  run: async (payload: SummarizePayload) => {
    const { summaryId, youtubeId } = payload;
    const language = payload.language ?? "en";
    const started = Date.now();

    try {
      const meta = await fetchVideoMetadata(youtubeId);
      const segments = await fetchTranscript(youtubeId, language);
      meta.durationSeconds = transcriptDuration(segments);

      if (meta.durationSeconds > MAX_DURATION_SECONDS) {
        await failSummary(
          summaryId,
          "This video is longer than 12 hours, which we can't process yet.",
        );
        return { summaryId, status: "failed" as const };
      }

      const { content, strategy } = await summarize(
        meta,
        segments,
        language,
        (progress, step) => updateSummaryProgress(summaryId, progress, step),
      );

      await completeSummary(summaryId, meta, content, strategy, {
        processingMs: Date.now() - started,
      });

      return { summaryId, status: "completed" as const, strategy };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Summarization failed.";
      await failSummary(summaryId, message);
      throw err; // let Trigger.dev record the failure / retry
    }
  },
});
