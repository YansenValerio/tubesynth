import type { TranscriptSegment } from "@/lib/types";

export interface TranscriptChunk {
  index: number;
  startTime: number;
  endTime: number;
  segments: TranscriptSegment[];
}

/**
 * Split a transcript into chunks of roughly `chunkSeconds` of video time.
 * Segments are never split; each lands wholly in one chunk.
 */
export function chunkByDuration(
  segments: TranscriptSegment[],
  chunkSeconds: number,
): TranscriptChunk[] {
  if (segments.length === 0) return [];

  const chunks: TranscriptChunk[] = [];
  let current: TranscriptSegment[] = [];
  let chunkStart = segments[0].start;

  for (const seg of segments) {
    if (seg.start - chunkStart >= chunkSeconds && current.length > 0) {
      chunks.push(makeChunk(chunks.length, current));
      current = [];
      chunkStart = seg.start;
    }
    current.push(seg);
  }
  if (current.length > 0) chunks.push(makeChunk(chunks.length, current));

  return chunks;
}

/** Group consecutive chunks into batches (for hierarchical synthesis). */
export function groupChunks<T>(items: T[], groupSize: number): T[][] {
  const groups: T[][] = [];
  for (let i = 0; i < items.length; i += groupSize) {
    groups.push(items.slice(i, i + groupSize));
  }
  return groups;
}

function makeChunk(
  index: number,
  segments: TranscriptSegment[],
): TranscriptChunk {
  const first = segments[0];
  const last = segments[segments.length - 1];
  return {
    index,
    startTime: first.start,
    endTime: Math.ceil(last.start + last.duration),
    segments,
  };
}
