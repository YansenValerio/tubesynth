import "server-only";

import type { QaMessage, SummaryContent, VideoMetadata } from "@/lib/types";

/**
 * Build a compact, timestamp-rich grounding context from a summary so the
 * model can answer questions and cite exact moments (PRD §F8).
 */
function buildContext(content: SummaryContent): string {
  const lines: string[] = [];
  lines.push(`TL;DR: ${content.tldr}`);
  lines.push(`OVERVIEW: ${content.overview}`);
  if (content.chapters.length) {
    lines.push("CHAPTERS:");
    for (const c of content.chapters) {
      lines.push(`- [${c.startTime}] ${c.title}: ${c.summary}`);
    }
  }
  if (content.keyPoints.length) {
    lines.push("KEY POINTS:");
    for (const p of content.keyPoints) {
      lines.push(`- [${p.timestamp}] ${p.point}`);
    }
  }
  if (content.keyQuotes.length) {
    lines.push("QUOTES:");
    for (const q of content.keyQuotes) {
      lines.push(`- [${q.timestamp}] "${q.quote}" — ${q.speaker ?? "Unknown"}`);
    }
  }
  return lines.join("\n");
}

export function buildQaPrompt(
  meta: VideoMetadata,
  content: SummaryContent,
  history: QaMessage[],
  question: string,
): string {
  const convo = history
    .slice(-8)
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n");

  return `You answer questions about a YouTube video using ONLY the structured summary below. Numbers in [brackets] are timestamps in SECONDS.

VIDEO: ${meta.title} — ${meta.channelName}

SUMMARY CONTEXT:
${buildContext(content)}

${convo ? `CONVERSATION SO FAR:\n${convo}\n` : ""}
USER QUESTION: ${question}

INSTRUCTIONS:
- Answer concisely and conversationally, grounded in the context above.
- Cite supporting moments inline using the EXACT format [<seconds>], e.g. [872]. Only cite timestamps that appear in the context.
- If the answer isn't in the context, say so plainly instead of guessing.
- Do not output JSON or markdown headers — just the prose answer with inline [seconds] citations.`;
}

/** Canned answer for the demo path (no Gemini key configured). */
export function sampleQaAnswer(question: string): string {
  const q = question.toLowerCase();
  if (q.includes("thesis") || q.includes("main")) {
    return "The central thesis is that natural language is becoming the new programming interface [872]. Karpathy frames a shift from writing code line-by-line toward orchestrating and verifying AI systems [1725], while arguing this raises — rather than removes — the value of deep fundamentals [4328].";
  }
  if (q.includes("replace") || q.includes("programmer") || q.includes("job")) {
    return "He doesn't think programmers get replaced — he expects the role to move up a level of abstraction toward orchestration and verification [1725]. The hard part was never typing the code, but knowing what to build and whether it's right [6258].";
  }
  if (q.includes("surprising") || q.includes("controversial")) {
    return "The most striking claim is that anyone who can describe what they want can now build software [3121] — a real democratization — even though models still struggle with long-horizon, multi-step tasks [5640].";
  }
  return "Based on the summary, Karpathy argues natural language is becoming the primary way we instruct software [872], shifting the engineer's job toward orchestration and verification [1725]. (This is a sample answer — add GEMINI_API_KEY for live, video-specific Q&A.)";
}

export { buildContext };
export type { QaMessage };
