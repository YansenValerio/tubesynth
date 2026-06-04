import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { setFavorite } from "@/lib/cache";

export const runtime = "nodejs";

/** Toggle the favorite flag on the caller's own summary. */
export async function POST(req: NextRequest) {
  let body: { summaryId?: string; value?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  if (!body.summaryId || typeof body.value !== "boolean") {
    return NextResponse.json(
      { ok: false, error: "Missing summaryId or value." },
      { status: 400 },
    );
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Not signed in." },
      { status: 401 },
    );
  }

  const ok = await setFavorite(body.summaryId, user.id, body.value);
  if (!ok) {
    return NextResponse.json(
      { ok: false, error: "Couldn't update favorite." },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true, value: body.value });
}
