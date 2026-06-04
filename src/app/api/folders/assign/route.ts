import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { assignSummaryToFolder } from "@/lib/folders";

export const runtime = "nodejs";

/** Move a summary into a folder, or out of folders when folderId is null. */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Not signed in." },
      { status: 401 },
    );
  }

  let body: { summaryId?: string; folderId?: string | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid body." }, { status: 400 });
  }

  if (!body.summaryId) {
    return NextResponse.json(
      { ok: false, error: "Missing summaryId." },
      { status: 400 },
    );
  }

  const ok = await assignSummaryToFolder(
    user.id,
    body.summaryId,
    body.folderId ?? null,
  );
  if (!ok) {
    return NextResponse.json(
      { ok: false, error: "Couldn't move summary." },
      { status: 400 },
    );
  }
  return NextResponse.json({ ok: true, folderId: body.folderId ?? null });
}
