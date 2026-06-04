import { NextResponse, type NextRequest } from "next/server";
import { extractYouTubeId } from "@/lib/youtube";
import { makeSummaryPublic } from "@/lib/cache";

export const runtime = "nodejs";

/**
 * Make a summary public and return its share slug. When Supabase isn't
 * configured (or the summary isn't persisted), responds with notConfigured so
 * the client can fall back to copying the current URL.
 */
export async function POST(req: NextRequest) {
  let body: { youtubeId?: string; language?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const youtubeId = extractYouTubeId(body.youtubeId ?? "");
  if (!youtubeId) {
    return NextResponse.json(
      { ok: false, error: "Invalid video id." },
      { status: 400 },
    );
  }
  const language = body.language?.trim() || "en";

  const slug = await makeSummaryPublic(youtubeId, language);
  if (!slug) {
    return NextResponse.json({ ok: false, notConfigured: true });
  }

  return NextResponse.json({ ok: true, slug, path: `/s/${slug}` });
}
