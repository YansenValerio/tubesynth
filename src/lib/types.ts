/**
 * Shared domain types. The Summary shape mirrors the JSON schema the
 * summarization engine produces (see PRD §6.3 / §8.5).
 */
import { z } from "zod";

export type SummaryStrategy = "single" | "chunked" | "hierarchical";
export type SummaryStatus = "pending" | "processing" | "completed" | "failed";
export type Importance = "high" | "medium" | "low";

export const chapterSchema = z.object({
  title: z.string(),
  startTime: z.number(),
  endTime: z.number(),
  summary: z.string(),
});

export const keyPointSchema = z.object({
  point: z.string(),
  timestamp: z.number(),
  importance: z.enum(["high", "medium", "low"]),
});

export const keyQuoteSchema = z.object({
  quote: z.string(),
  speaker: z.string().nullable().optional(),
  timestamp: z.number(),
});

export const summaryContentSchema = z.object({
  tldr: z.string(),
  overview: z.string(),
  chapters: z.array(chapterSchema),
  keyPoints: z.array(keyPointSchema),
  keyQuotes: z.array(keyQuoteSchema),
  actionItems: z.array(z.string()),
  topics: z.array(z.string()),
  estimatedReadTime: z.number().optional(),
});

export type Chapter = z.infer<typeof chapterSchema>;
export type KeyPoint = z.infer<typeof keyPointSchema>;
export type KeyQuote = z.infer<typeof keyQuoteSchema>;
export type SummaryContent = z.infer<typeof summaryContentSchema>;

export interface VideoMetadata {
  youtubeId: string;
  title: string;
  channelName: string;
  durationSeconds: number;
  thumbnailUrl: string;
  language?: string;
}

export interface TranscriptSegment {
  text: string;
  start: number;
  duration: number;
}

export interface QaMessage {
  role: "user" | "assistant";
  content: string;
}
