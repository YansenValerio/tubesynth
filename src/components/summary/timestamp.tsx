"use client";

import { cn } from "@/lib/utils";
import { formatTimestamp } from "@/lib/utils";

interface TimestampProps {
  seconds: number;
  onSeek: (seconds: number) => void;
  variant?: "pill" | "inline";
  className?: string;
}

/** Clickable timestamp — the core navigation primitive (Design §3). */
export function Timestamp({
  seconds,
  onSeek,
  variant = "pill",
  className,
}: TimestampProps) {
  return (
    <button
      type="button"
      onClick={() => onSeek(seconds)}
      title="Jump to this moment"
      className={cn(
        "font-mono text-accent transition-colors hover:text-accent-hover",
        variant === "pill" &&
          "rounded-pill bg-surface-2 px-2 py-0.5 text-xs hover:bg-accent/10",
        variant === "inline" && "text-[0.95em] underline-offset-2 hover:underline",
        className,
      )}
    >
      {formatTimestamp(seconds)}
    </button>
  );
}
