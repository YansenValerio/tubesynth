import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { isConfigured } from "@/lib/env";
import { getCurrentUser, displayName } from "@/lib/auth";
import { getUserSummaries } from "@/lib/history";
import { getUserFolders } from "@/lib/folders";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export default async function DashboardPage() {
  // Auth not configured → show a friendly, non-blocking notice.
  if (!isConfigured()) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-6 text-center">
        <h1 className="font-serif text-3xl text-text-primary">
          Your library, soon
        </h1>
        <p className="mt-3 text-text-secondary">
          Sign-in and history need Supabase configured. Add your credentials to{" "}
          <span className="font-mono text-accent">.env.local</span> to enable
          accounts. You can still summarize videos without one.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-accent transition-colors hover:text-accent-hover"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </main>
    );
  }

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [summaries, folders] = await Promise.all([
    getUserSummaries(user.id),
    getUserFolders(user.id),
  ]);

  return (
    <DashboardClient
      name={displayName(user)}
      summaries={summaries}
      folders={folders}
    />
  );
}
