import type { TranscriptSegment, VideoMetadata } from "@/lib/types";
import { formatDuration, formatTimestamp } from "@/lib/utils";

/** Render transcript segments as timestamped lines for the model. */
export function renderTranscript(segments: TranscriptSegment[]): string {
  return segments
    .map((s) => `[${formatTimestamp(s.start)}] ${s.text}`)
    .join("\n");
}

const OUTPUT_SCHEMA = `{
  "tldr": "2-3 sentence summary capturing the core message",
  "overview": "1-2 paragraph executive summary",
  "chapters": [
    { "title": "Chapter title", "startTime": <seconds>, "endTime": <seconds>, "summary": "Detailed paragraph summary" }
  ],
  "keyPoints": [
    { "point": "Specific insight or claim", "timestamp": <seconds>, "importance": "high|medium|low" }
  ],
  "keyQuotes": [
    { "quote": "Exact memorable quote", "speaker": "Speaker name or null", "timestamp": <seconds> }
  ],
  "actionItems": ["concrete takeaway 1"],
  "topics": ["main topic 1"]
}`;

/** Master single-pass prompt (PRD §8.5). */
export function singlePassPrompt(
  meta: VideoMetadata,
  transcript: string,
  outputLanguage: string,
): string {
  return `You are an expert at distilling long-form video content into actionable summaries.

VIDEO METADATA:
- Title: ${meta.title}
- Channel: ${meta.channelName}
- Duration: ${formatDuration(meta.durationSeconds)}

TRANSCRIPT (timestamps in [h:mm:ss] or [mm:ss]):
${transcript}

OUTPUT FORMAT:
Return ONLY a JSON object with this exact schema (no markdown, no prose):
${OUTPUT_SCHEMA}

GUIDELINES:
1. Extract 5-15 chapters depending on length and content density.
2. Include 8-20 key points, prioritized by importance.
3. Extract 3-8 memorable quotes that capture key ideas.
4. Action items must be concrete and actionable.
5. Topics: 5-10 main themes.
6. All timestamps are integer SECONDS derived from the transcript markers.
7. Write in ${outputLanguage}.
8. Preserve technical terms and proper nouns.
9. Do not invent information not in the transcript.`;
}

/** Per-chunk prompt (PRD §8.5). */
export function chunkPrompt(
  meta: VideoMetadata,
  chunkIndex: number,
  totalChunks: number,
  startTime: number,
  endTime: number,
  previousTopic: string,
  chunkTranscript: string,
): string {
  return `You are summarizing chunk ${chunkIndex + 1} of ${totalChunks} from a longer video.

CONTEXT:
- Video title: ${meta.title}
- This chunk covers: ${formatTimestamp(startTime)} to ${formatTimestamp(endTime)}
- Previous chunk ended discussing: ${previousTopic || "n/a (this is the start)"}

CHUNK TRANSCRIPT:
${chunkTranscript}

TASK:
Produce a detailed summary of THIS CHUNK ONLY. Return ONLY JSON:
{
  "chunkTitle": "Suggested chapter title",
  "summary": "Detailed paragraph",
  "keyPoints": [{ "point": "", "timestamp": <seconds>, "importance": "high|medium|low" }],
  "keyQuotes": [{ "quote": "", "speaker": "name or null", "timestamp": <seconds> }],
  "topicsDiscussed": ["topic1"],
  "transitionsTo": "What this chunk leads into"
}

Timestamps are integer SECONDS. Be detailed — this will be combined later.`;
}

/** Translate the text fields of a summary into another language (PRD §F10). */
export function translatePrompt(
  contentJson: string,
  targetLanguage: string,
): string {
  return `Translate the human-readable text fields of this video-summary JSON into ${targetLanguage}.

INPUT JSON:
${contentJson}

RULES:
- Return ONLY a JSON object with the EXACT same schema, keys, array order, and array lengths.
- Translate ONLY these fields: tldr, overview, chapters[].title, chapters[].summary, keyPoints[].point, keyQuotes[].quote, actionItems[], topics[].
- DO NOT change numeric fields (startTime, endTime, timestamp, estimatedReadTime), the importance enums, or speaker names.
- Keep proper nouns and technical terms accurate; translate naturally, not word-for-word.`;
}

/** Synthesis prompt that merges chunk summaries into the final schema. */
export function synthesisPrompt(
  meta: VideoMetadata,
  chunkSummariesJson: string,
  outputLanguage: string,
): string {
  return `You are synthesizing summaries from multiple chunks into a unified video summary.

VIDEO METADATA:
- Title: ${meta.title}
- Total duration: ${formatDuration(meta.durationSeconds)}

CHUNK SUMMARIES (JSON):
${chunkSummariesJson}

TASK:
Produce a unified summary. Return ONLY a JSON object with this exact schema:
${OUTPUT_SCHEMA}

PRINCIPLES:
1. Merge similar chapters intelligently; derive chapter start/end from the chunk timestamps.
2. Pick THE BEST quotes (not all).
3. Promote keyPoints that appear across multiple chunks.
4. Action items: consolidate, dedupe, prioritize.
5. Topics: identify the MAIN themes, not an exhaustive list.
6. Preserve all original timestamps (integer seconds).
7. TLDR must reflect the FULL video, not just the first chunks.
8. Write in ${outputLanguage}.`;
}
