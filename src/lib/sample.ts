import type { SummaryContent, VideoMetadata } from "@/lib/types";
import { thumbnailUrl } from "@/lib/youtube";

/**
 * A realistic sample summary used for the landing-page examples and as a
 * graceful demo fallback when integrations aren't configured yet. Content is
 * illustrative — not a verbatim transcript of any real video.
 */
export const SAMPLE_METADATA: VideoMetadata = {
  youtubeId: "LCEmiRjPEtQ",
  title: "Andrej Karpathy: Software in the Era of AI",
  channelName: "Lex Fridman Podcast",
  durationSeconds: 13320, // 3h 42m
  thumbnailUrl: thumbnailUrl("LCEmiRjPEtQ", "maxres"),
  language: "en",
};

export const SAMPLE_SUMMARY: SummaryContent = {
  tldr: "Karpathy argues that natural language is becoming the new programming interface. The engineer's role is shifting from writing code line-by-line to orchestrating systems and verifying AI output — a change that broadens who can build software while raising the value of deep fundamentals.",
  overview:
    "Across the conversation, Karpathy frames the current moment as a genuine phase change in how software is made. He describes a spectrum from 'Software 1.0' (explicit code) through 'Software 2.0' (learned weights) to an emerging 'Software 3.0' where prompts in natural language steer capable models. Rather than predicting that programmers disappear, he expects the job to move up a level of abstraction: more time spent specifying intent, designing systems, and checking results, and less time on boilerplate.\n\nHe is candid about the limits — models still hallucinate, struggle with long-horizon tasks, and need careful human verification. The throughline is optimistic but grounded: AI lowers the floor for newcomers while raising the ceiling for experts who understand what's happening underneath.",
  chapters: [
    {
      title: "Software 1.0, 2.0, and 3.0",
      startTime: 0,
      endTime: 1230,
      summary:
        "Karpathy lays out his taxonomy: explicit code, learned weights, and prompt-steered models. He argues each layer doesn't replace the last so much as sit on top of it.",
    },
    {
      title: "Natural language as a programming interface",
      startTime: 1230,
      endTime: 2880,
      summary:
        "The central claim of the conversation: describing what you want is becoming a legitimate way to build software, shifting the bottleneck from syntax to clear thinking.",
    },
    {
      title: "What happens to programmers",
      startTime: 2880,
      endTime: 5400,
      summary:
        "Rather than replacement, Karpathy sees the role moving toward orchestration, verification, and systems design — with fundamentals mattering more, not less.",
    },
    {
      title: "Limits, hallucination, and verification",
      startTime: 5400,
      endTime: 8100,
      summary:
        "A candid section on where today's models fail: long-horizon tasks, reliability, and the human work of checking output remain unsolved.",
    },
    {
      title: "Education and democratization",
      startTime: 8100,
      endTime: 13320,
      summary:
        "Karpathy is most excited about access — anyone who can describe a problem can now start building — while warning that depth still separates the people building foundations.",
    },
  ],
  keyPoints: [
    { point: "Natural language is becoming the new programming language.", timestamp: 872, importance: "high" },
    { point: "The programmer's role shifts toward orchestration and verification.", timestamp: 1725, importance: "high" },
    { point: "Models still struggle with long-horizon, multi-step tasks.", timestamp: 5640, importance: "high" },
    { point: "Democratization increases — not eliminates — the need for fundamentals.", timestamp: 4328, importance: "medium" },
    { point: "Verification is the new bottleneck, not generation.", timestamp: 6210, importance: "medium" },
    { point: "'Software 3.0' steers learned models with prompts.", timestamp: 410, importance: "medium" },
  ],
  keyQuotes: [
    {
      quote: "Now anyone who can describe what they want can build software.",
      speaker: "Andrej Karpathy",
      timestamp: 3121,
    },
    {
      quote: "The hard part was never typing the code — it was knowing what to build and whether it's right.",
      speaker: "Andrej Karpathy",
      timestamp: 6258,
    },
    {
      quote: "We're not removing the programmer; we're moving them up a level of abstraction.",
      speaker: "Andrej Karpathy",
      timestamp: 1725,
    },
  ],
  actionItems: [
    "Practice specifying intent precisely — clear thinking is the new core skill.",
    "Build a habit of verifying AI output instead of trusting it by default.",
    "Invest in fundamentals; they compound as abstractions rise.",
  ],
  topics: [
    "AI",
    "Software Engineering",
    "Programming",
    "Education",
    "Future of Work",
  ],
  estimatedReadTime: 8,
};
