"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { extractYouTubeId } from "@/lib/youtube";

interface UrlInputProps {
  size?: "lg" | "md";
  autoFocus?: boolean;
  className?: string;
}

export function UrlInput({
  size = "lg",
  autoFocus = false,
  className,
}: UrlInputProps) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const id = extractYouTubeId(value);
    if (!id) {
      setError("That doesn't look like a YouTube link. Try again.");
      return;
    }
    setError(null);
    setSubmitting(true);
    router.push(`/summary/${id}`);
  }

  const isLarge = size === "lg";

  return (
    <form onSubmit={handleSubmit} className={cn("w-full", className)}>
      <div
        className={cn(
          "group flex items-center gap-2 rounded-pill border bg-surface pr-2 transition-colors duration-200",
          "focus-within:border-accent",
          error ? "border-danger" : "border-border",
          isLarge ? "pl-5 py-2" : "pl-4 py-1.5",
        )}
      >
        <input
          type="text"
          inputMode="url"
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError(null);
          }}
          placeholder="Paste a YouTube URL…"
          aria-label="YouTube URL"
          className={cn(
            "min-w-0 flex-1 bg-transparent text-text-primary placeholder:text-text-tertiary outline-none",
            isLarge ? "text-base py-2" : "text-sm py-1.5",
          )}
        />
        <button
          type="submit"
          disabled={submitting}
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-pill bg-accent font-medium text-accent-contrast transition-colors duration-200 hover:bg-accent-hover disabled:opacity-70",
            isLarge ? "px-5 py-2.5 text-[15px]" : "px-4 py-2 text-sm",
          )}
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading</span>
            </>
          ) : (
            <>
              <span>Summarize</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
      {error ? (
        <p className="mt-2 pl-5 text-sm text-danger">{error}</p>
      ) : null}
    </form>
  );
}
