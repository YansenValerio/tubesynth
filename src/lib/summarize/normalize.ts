import type {
  Chapter,
  Importance,
  KeyPoint,
  KeyQuote,
  SummaryContent,
} from "@/lib/types";

/**
 * Defensive normalization of model output into a valid SummaryContent.
 * Models occasionally drift from the schema (missing fields, string numbers,
 * out-of-range importance); this clamps everything into shape so the UI never
 * breaks on a single malformed field.
 */
export function normalizeSummary(
  raw: Partial<SummaryContent> | undefined,
  durationSeconds: number,
): SummaryContent {
  const data = raw ?? {};

  return {
    tldr: str(data.tldr),
    overview: str(data.overview),
    chapters: arr(data.chapters)
      .map((c) => normalizeChapter(c, durationSeconds))
      .filter((c): c is Chapter => c !== null),
    keyPoints: arr(data.keyPoints)
      .map(normalizeKeyPoint)
      .filter((p): p is KeyPoint => p !== null),
    keyQuotes: arr(data.keyQuotes)
      .map(normalizeQuote)
      .filter((q): q is KeyQuote => q !== null),
    actionItems: arr(data.actionItems).map(str).filter(Boolean),
    topics: arr(data.topics).map(str).filter(Boolean),
    estimatedReadTime: 0,
  };
}

/** ~200 wpm reading speed over all prose in the summary. */
export function estimateReadTime(content: SummaryContent): number {
  const words = [
    content.tldr,
    content.overview,
    ...content.chapters.map((c) => c.summary),
    ...content.keyPoints.map((p) => p.point),
    ...content.keyQuotes.map((q) => q.quote),
    ...content.actionItems,
  ]
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function normalizeChapter(c: unknown, duration: number): Chapter | null {
  if (!isRecord(c)) return null;
  const startTime = num(c.startTime);
  return {
    title: str(c.title) || "Untitled section",
    startTime,
    endTime: num(c.endTime) || Math.min(startTime + 60, duration),
    summary: str(c.summary),
  };
}

function normalizeKeyPoint(p: unknown): KeyPoint | null {
  if (!isRecord(p)) return null;
  const point = str(p.point);
  if (!point) return null;
  return {
    point,
    timestamp: num(p.timestamp),
    importance: importance(p.importance),
  };
}

function normalizeQuote(q: unknown): KeyQuote | null {
  if (!isRecord(q)) return null;
  const quote = str(q.quote);
  if (!quote) return null;
  const speaker = q.speaker == null ? null : str(q.speaker) || null;
  return { quote, speaker, timestamp: num(q.timestamp) };
}

function importance(value: unknown): Importance {
  return value === "high" || value === "low" ? value : "medium";
}

function str(value: unknown): string {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

function num(value: unknown): number {
  const n = typeof value === "number" ? value : parseFloat(String(value));
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}

function arr(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
