import { NextResponse, type NextRequest } from "next/server";
import { getSummaryStatus } from "@/lib/cache";

export const runtime = "nodejs";

/** Poll the progress/result of a background summarization job. */
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { ok: false, error: "Missing id." },
      { status: 400 },
    );
  }

  const result = await getSummaryStatus(id);
  if (!result) {
    return NextResponse.json(
      { ok: false, error: "Summary not found." },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true, ...result });
}
