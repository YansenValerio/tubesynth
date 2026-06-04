import type { SummaryContent, VideoMetadata } from "@/lib/types";
import { formatDuration, formatTimestamp } from "@/lib/utils";
import { watchUrl } from "@/lib/youtube";

/** Render a summary as portable Markdown (PRD §F6.1). */
export function summaryToMarkdown(
  meta: VideoMetadata,
  content: SummaryContent,
): string {
  const lines: string[] = [];
  lines.push(`# ${meta.title}`);
  lines.push(
    `_${meta.channelName} · ${formatDuration(meta.durationSeconds)} · [Watch on YouTube](${watchUrl(meta.youtubeId)})_`,
  );
  lines.push("");
  lines.push("## TL;DR");
  lines.push(content.tldr);
  lines.push("");
  lines.push("## Overview");
  lines.push(content.overview);
  lines.push("");

  if (content.chapters.length) {
    lines.push("## Chapters");
    for (const c of content.chapters) {
      lines.push(`### ${formatTimestamp(c.startTime)} — ${c.title}`);
      lines.push(c.summary);
      lines.push("");
    }
  }

  if (content.keyPoints.length) {
    lines.push("## Key Points");
    for (const p of content.keyPoints) {
      lines.push(`- \`${formatTimestamp(p.timestamp)}\` ${p.point}`);
    }
    lines.push("");
  }

  if (content.keyQuotes.length) {
    lines.push("## Quotes");
    for (const q of content.keyQuotes) {
      lines.push(
        `> ${q.quote}\n> — ${q.speaker ?? "Unknown"} (${formatTimestamp(q.timestamp)})`,
      );
      lines.push("");
    }
  }

  if (content.actionItems.length) {
    lines.push("## Action Items");
    for (const a of content.actionItems) lines.push(`- [ ] ${a}`);
    lines.push("");
  }

  if (content.topics.length) {
    lines.push("## Topics");
    lines.push(content.topics.map((t) => `#${t.replace(/\s+/g, "")}`).join(" "));
  }

  lines.push("");
  lines.push("---");
  lines.push("_Summarized with TubeSynth_");
  return lines.join("\n");
}
