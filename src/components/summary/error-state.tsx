"use client";

import Link from "next/link";
import { Unlink } from "lucide-react";

interface ErrorStateProps {
  message: string;
  code?: string;
}

/** Calm, helpful failure state (Design §7.1). */
export function ErrorState({ message, code }: ErrorStateProps) {
  const noTranscript = code === "NO_TRANSCRIPT_AVAILABLE";

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-6 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full border border-border text-text-tertiary">
        <Unlink className="h-5 w-5" />
      </span>
      <h1 className="mt-6 font-serif text-2xl text-text-primary">
        We couldn&apos;t process this video
      </h1>
      <p className="mt-3 leading-relaxed text-text-secondary">{message}</p>

      {noTranscript && (
        <ul className="mt-5 space-y-1.5 text-left text-sm text-text-tertiary">
          <li>• Try a different video from the same channel</li>
          <li>• Check if the video shows CC when you play it</li>
          <li>• Some live streams take time to generate captions</li>
        </ul>
      )}

      <div className="mt-8 flex items-center gap-3">
        <Link
          href="/"
          className="rounded-pill bg-accent px-5 py-2.5 text-sm font-medium text-accent-contrast transition-colors hover:bg-accent-hover"
        >
          Try another video
        </Link>
      </div>

      {code && (
        <p className="mt-6 font-mono text-xs text-text-tertiary">
          Error code: {code}
        </p>
      )}
    </div>
  );
}
