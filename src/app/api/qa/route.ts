import { NextResponse, type NextRequest } from "next/server";
import type { QaMessage, SummaryContent, VideoMetadata } from "@/lib/types";
import { generateText } from "@/lib/gemini";
import { buildQaPrompt, sampleQaAnswer } from "@/lib/qa";

export const runtime = "nodejs";
export const maxDuration = 60;

interface QaBody {
  metadata: VideoMetadata;
  content: SummaryContent;
  question: string;
  history?: QaMessage[];
}

export async function POST(req: NextRequest) {
  let body: QaBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const question = body.question?.trim();
  if (!question) {
    return NextResponse.json(
      { ok: false, error: "Ask a question first." },
      { status: 400 },
    );
  }
  if (!body.content || !body.metadata) {
    return NextResponse.json(
      { ok: false, error: "Missing summary context." },
      { status: 400 },
    );
  }

  // Demo path: no model configured → canned, still-cited answer.
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({
      ok: true,
      demo: true,
      answer: sampleQaAnswer(question),
    });
  }

  try {
    const prompt = buildQaPrompt(
      body.metadata,
      body.content,
      body.history ?? [],
      question,
    );
    const { text } = await generateText(prompt);
    return NextResponse.json({ ok: true, answer: text });
  } catch (err) {
    console.error("qa failed:", err);
    return NextResponse.json(
      { ok: false, error: "Couldn't answer right now. Try again." },
      { status: 500 },
    );
  }
}
