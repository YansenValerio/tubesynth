import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { isConfigured } from "@/lib/env";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage() {
  if (isConfigured()) {
    const user = await getCurrentUser();
    if (user) redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <Link
        href="/"
        className="mb-10 inline-flex items-center gap-1.5 text-sm text-text-tertiary transition-colors hover:text-text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <h1 className="font-serif text-3xl text-text-primary">
        Welcome to Tube<span className="text-accent">Synth</span>
      </h1>
      <p className="mt-2 text-text-secondary">
        Sign in to save your summaries and build a library.
      </p>

      <div className="mt-8">
        {isConfigured() ? (
          <LoginForm />
        ) : (
          <div className="rounded-card border border-border bg-surface p-5 text-sm text-text-secondary">
            Authentication isn&apos;t configured yet. Add your Supabase
            credentials to <span className="font-mono text-accent">.env.local</span>{" "}
            to enable sign-in. You can still summarize videos without an account.
          </div>
        )}
      </div>

      <p className="mt-8 text-center text-xs text-text-tertiary">
        No account needed to summarize — sign-in only saves your history.
      </p>
    </main>
  );
}
