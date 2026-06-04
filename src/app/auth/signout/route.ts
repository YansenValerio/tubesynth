import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/ssr";
import { isConfigured } from "@/lib/env";

export async function POST(req: NextRequest) {
  if (isConfigured()) {
    try {
      const supabase = await createSupabaseServerClient();
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
  }
  return NextResponse.redirect(new URL("/", req.url), { status: 303 });
}
