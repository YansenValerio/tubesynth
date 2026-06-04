import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createFolder, deleteFolder } from "@/lib/folders";

export const runtime = "nodejs";

/** Create a folder for the signed-in user. */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Not signed in." },
      { status: 401 },
    );
  }

  let body: { name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid body." }, { status: 400 });
  }

  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json(
      { ok: false, error: "Folder name is required." },
      { status: 400 },
    );
  }

  const folder = await createFolder(user.id, name);
  if (!folder) {
    return NextResponse.json(
      { ok: false, error: "Couldn't create folder." },
      { status: 400 },
    );
  }
  return NextResponse.json({ ok: true, folder });
}

/** Delete one of the user's folders. */
export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Not signed in." },
      { status: 401 },
    );
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ ok: false, error: "Missing id." }, { status: 400 });
  }

  const ok = await deleteFolder(user.id, id);
  if (!ok) {
    return NextResponse.json(
      { ok: false, error: "Couldn't delete folder." },
      { status: 400 },
    );
  }
  return NextResponse.json({ ok: true });
}
