// Server-side only. Shared by Next routes and the Trigger.dev worker, so no
// `server-only` guard.
import pMap from "p-map";
import type {
  SummaryContent,
  SummaryStrategy,
  TranscriptSegment,
  VideoMetadata,
} from "@/lib/types";
import { generateJson } from "@/lib/gemini";
import {
  chunkPrompt,
  renderTranscript,
  singlePassPrompt,
  synthesisPrompt,
} from "./prompts";
import { chunkByDuration, groupChunks, type TranscriptChunk } from "./chunk";
import { normalizeSummary, estimateReadTime } from "./normalize";

export type ProgressFn = (progress: number, step: string) => void | Promise<void>;

interface ChunkSummary {
  chunkTitle: string;
  summary: string;
  startTime: number;
  endTime: number;
  keyPoints: unknown[];
  keyQuotes: unknown[];
  topicsDiscussed: string[];
  transitionsTo: string;
}

// Kept low to respect Gemini free-tier rate limits (~5 requests/minute).
// gemini.ts retries on 429, so this mainly controls burst size.
const CONCURRENCY = 2;

/** Pick a strategy from duration (PRD §8.4). */
export function chooseStrategy(durationSeconds: number): SummaryStrategy {
  if (durationSeconds < 2 * 3600) return "single";
  if (durationSeconds < 6 * 3600) return "chunked";
  return "hierarchical";
}

/** Top-level entry: choose a strategy and run it with progress reporting. */
export async function summarize(
  meta: VideoMetadata,
  segments: TranscriptSegment[],
  language: string,
  onProgress: ProgressFn = () => {},
): Promise<{ content: SummaryContent; strategy: SummaryStrategy }> {
  const strategy = chooseStrategy(meta.durationSeconds);
  await onProgress(10, `Strategy: ${strategy}`);

  let content: SummaryContent;
  switch (strategy) {
    case "single":
      content = await singlePass(meta, segments, language, onProgress);
      break;
    case "chunked":
      content = await chunked(meta, segments, language, 30 * 60, onProgress);
      break;
    case "hierarchical":
      content = await hierarchical(meta, segments, language, onProgress);
      break;
  }

  content.estimatedReadTime = estimateReadTime(content);
  await onProgress(100, "Done");
  return { content, strategy };
}

async function singlePass(
  meta: VideoMetadata,
  segments: TranscriptSegment[],
  language: string,
  onProgress: ProgressFn,
): Promise<SummaryContent> {
  await onProgress(40, "Summarizing");
  const { data } = await generateJson<SummaryContent>(
    singlePassPrompt(meta, renderTranscript(segments), language),
  );
  await onProgress(90, "Polishing output");
  return normalizeSummary(data, meta.durationSeconds);
}

async function chunked(
  meta: VideoMetadata,
  segments: TranscriptSegment[],
  language: string,
  chunkSeconds: number,
  onProgress: ProgressFn,
): Promise<SummaryContent> {
  const chunks = chunkByDuration(segments, chunkSeconds);
  await onProgress(20, `Chunked into ${chunks.length} parts`);

  const chunkSummaries = await summarizeChunks(meta, chunks, onProgress);

  await onProgress(85, "Synthesizing final summary");
  return synthesize(meta, chunkSummaries, language);
}

async function hierarchical(
  meta: VideoMetadata,
  segments: TranscriptSegment[],
  language: string,
  onProgress: ProgressFn,
): Promise<SummaryContent> {
  const chunks = chunkByDuration(segments, 60 * 60); // 1-hour chunks
  await onProgress(15, `Chunked into ${chunks.length} parts`);

  const chunkSummaries = await summarizeChunks(meta, chunks, onProgress, 15, 65);

  // Level 1: synthesize groups of 3 chunk-summaries into intermediates.
  await onProgress(70, "Grouping sections");
  const groups = groupChunks(chunkSummaries, 3);
  const intermediates = await pMap(
    groups,
    (group) => synthesize(meta, group, language),
    { concurrency: CONCURRENCY },
  );

  // Level 2: final synthesis across intermediates.
  await onProgress(90, "Synthesizing final summary");
  return synthesize(meta, intermediates, language);
}

async function summarizeChunks(
  meta: VideoMetadata,
  chunks: TranscriptChunk[],
  onProgress: ProgressFn,
  progressStart = 20,
  progressEnd = 80,
): Promise<ChunkSummary[]> {
  let completed = 0;
  return pMap(
    chunks,
    async (chunk) => {
      const prompt = chunkPrompt(
        meta,
        chunk.index,
        chunks.length,
        chunk.startTime,
        chunk.endTime,
        chunk.index > 0 ? `chunk ${chunk.index}` : "",
        renderTranscript(chunk.segments),
      );
      const { data } = await generateJson<Partial<ChunkSummary>>(prompt);
      completed += 1;
      await onProgress(
        progressStart +
          Math.floor((completed / chunks.length) * (progressEnd - progressStart)),
        `Summarized ${completed}/${chunks.length}`,
      );
      return {
        chunkTitle: data.chunkTitle ?? `Part ${chunk.index + 1}`,
        summary: data.summary ?? "",
        startTime: chunk.startTime,
        endTime: chunk.endTime,
        keyPoints: data.keyPoints ?? [],
        keyQuotes: data.keyQuotes ?? [],
        topicsDiscussed: data.topicsDiscussed ?? [],
        transitionsTo: data.transitionsTo ?? "",
      } satisfies ChunkSummary;
    },
    { concurrency: CONCURRENCY },
  );
}

async function synthesize(
  meta: VideoMetadata,
  items: unknown[],
  language: string,
): Promise<SummaryContent> {
  const { data } = await generateJson<SummaryContent>(
    synthesisPrompt(meta, JSON.stringify(items), language),
  );
  return normalizeSummary(data, meta.durationSeconds);
}
