"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProcessingStateProps {
  title?: string;
  channel?: string;
  thumbnailUrl?: string;
  /** When provided, show real progress (0-100) instead of the simulation. */
  progress?: number;
  /** Real current-step label from the backend. */
  step?: string;
}

const STEPS = [
  "Fetching transcript",
  "Detecting chapters",
  "Summarizing chunks",
  "Synthesizing final summary",
  "Polishing output",
];

const MESSAGES = [
  "Reading through the whole thing so you don't have to…",
  "Found a few interesting moments already…",
  "Cross-referencing key concepts…",
  "Picking out the quotes worth keeping…",
  "Almost there — synthesis is the hardest part…",
];

/**
 * Processing/loading takeover (Design §4). Progress is simulated client-side
 * (the request runs synchronously); it eases toward ~92% and the parent
 * swaps in the result when the API resolves.
 */
export function ProcessingState({
  title,
  channel,
  thumbnailUrl,
  progress: realProgress,
  step,
}: ProcessingStateProps) {
  const [simProgress, setSimProgress] = useState(6);
  const [message, setMessage] = useState(0);
  const simulated = realProgress === undefined;

  useEffect(() => {
    if (!simulated) return;
    const t = setInterval(() => {
      setSimProgress((p) => (p < 92 ? p + Math.max(0.5, (92 - p) * 0.06) : p));
    }, 400);
    return () => clearInterval(t);
  }, [simulated]);

  useEffect(() => {
    const t = setInterval(() => setMessage((m) => (m + 1) % MESSAGES.length), 3500);
    return () => clearInterval(t);
  }, []);

  const progress = realProgress ?? simProgress;
  const activeStep = Math.min(
    STEPS.length - 1,
    Math.floor((progress / 100) * STEPS.length),
  );
  const statusLine = step ?? `${STEPS[activeStep]}…`;

  return (
    <div className="relative flex min-h-screen items-center justify-center px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--surface)_0%,transparent_60%)] opacity-50" />
      <Link
        href="/"
        className="absolute left-6 top-6 inline-flex items-center gap-1.5 text-sm text-text-tertiary transition-colors hover:text-text-primary"
      >
        <X className="h-4 w-4" />
        Cancel
      </Link>

      <div className="relative w-full max-w-md">
        {/* Video card */}
        <div className="flex items-center gap-4 rounded-card border border-border bg-surface p-4">
          {thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt=""
              width={96}
              height={54}
              unoptimized
              className="h-[54px] w-24 shrink-0 rounded-base object-cover"
            />
          ) : (
            <div className="h-[54px] w-24 shrink-0 rounded-base bg-surface-2" />
          )}
          <div className="min-w-0">
            <p className="truncate font-serif text-text-primary">
              {title ?? "Your video"}
            </p>
            <p className="truncate text-sm text-text-tertiary">
              {channel ?? "Processing…"}
            </p>
          </div>
        </div>

        {/* Status */}
        <div className="mt-8 text-center">
          <p className="font-serif text-lg italic text-text-primary">
            {statusLine}
          </p>
          <div className="mt-4 h-1.5 overflow-hidden rounded-pill bg-surface-2">
            <div
              className="h-full rounded-pill bg-accent transition-[width] duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 font-mono text-xs text-text-tertiary">
            {Math.round(progress)}%
          </p>
        </div>

        {/* Steps */}
        <ul className="mt-8 space-y-3">
          {STEPS.map((step, i) => {
            const state =
              i < activeStep ? "done" : i === activeStep ? "active" : "pending";
            return (
              <li key={step} className="flex items-center gap-3 text-sm">
                <span className="flex h-5 w-5 items-center justify-center">
                  {state === "done" && (
                    <Check className="h-4 w-4 text-success" />
                  )}
                  {state === "active" && (
                    <Loader2 className="h-4 w-4 animate-spin text-accent" />
                  )}
                  {state === "pending" && (
                    <span className="h-2 w-2 rounded-full border border-text-tertiary" />
                  )}
                </span>
                <span
                  className={cn(
                    state === "done" && "text-text-tertiary",
                    state === "active" && "text-text-primary",
                    state === "pending" && "text-text-tertiary",
                  )}
                >
                  {step}
                </span>
              </li>
            );
          })}
        </ul>

        <p className="mt-8 text-center text-sm italic text-text-tertiary transition-opacity">
          {MESSAGES[message]}
        </p>
      </div>
    </div>
  );
}
