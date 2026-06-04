import { NextResponse, type NextRequest } from "next/server";
import type { SummaryContent, VideoMetadata } from "@/lib/types";
import { generateJson } from "@/lib/gemini";
import { translatePrompt } from "@/lib/summarize/prompts";
import { normalizeSummary } from "@/lib/summarize/normalize";
import { isSupportedLanguage, languageLabel } from "@/lib/i18n";

export const runtime = "nodejs";
export const maxDuration = 120;

interface TranslateBody {
  metadata: VideoMetadata;
  content: SummaryContent;
  targetLanguage: string;
}

export async function POST(req: NextRequest) {
  let body: TranslateBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  if (!body.content || !body.targetLanguage) {
    return NextResponse.json(
      { ok: false, error: "Missing content or target language." },
      { status: 400 },
    );
  }
  if (!isSupportedLanguage(body.targetLanguage)) {
    return NextResponse.json(
      { ok: false, error: "Unsupported language." },
      { status: 400 },
    );
  }

  // Demo path: no model → return the original content unchanged.
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({
      ok: true,
      demo: true,
      content: body.content,
    });
  }

  try {
    const { data } = await generateJson<SummaryContent>(
      translatePrompt(
        JSON.stringify(body.content),
        languageLabel(body.targetLanguage),
      ),
    );
    const content = normalizeSummary(
      data,
      body.metadata?.durationSeconds ?? 0,
    );
    content.estimatedReadTime = body.content.estimatedReadTime;
    return NextResponse.json({ ok: true, content });
  } catch (err) {
    console.error("translate failed:", err);
    return NextResponse.json(
      { ok: false, error: "Couldn't translate right now. Try again." },
      { status: 500 },
    );
  }
}
