"use client";

import { useEffect, useRef, useState } from "react";
import type { SummaryContent, VideoMetadata } from "@/lib/types";
import { thumbnailUrl } from "@/lib/youtube";
import { SAMPLE_METADATA, SAMPLE_SUMMARY } from "@/lib/sample";
import { SummaryView } from "./summary-view";
import { ProcessingState } from "./processing-state";
import { ErrorState } from "./error-state";

interface SummaryClientProps {
  id: string;
}

type State =
  | { phase: "loading" }
  | {
      phase: "job";
      summaryId: string;
      metadata: VideoMetadata;
      progress: number;
      step?: string;
    }
  | {
      phase: "done";
      metadata: VideoMetadata;
      content: SummaryContent;
      cached?: boolean;
      banner?: string;
    }
  | { phase: "error"; message: string; code?: string };

export function SummaryClient({ id }: SummaryClientProps) {
  const [state, setState] = useState<State>(() =>
    id.startsWith("example-")
      ? {
          phase: "done",
          metadata: SAMPLE_METADATA,
          content: SAMPLE_SUMMARY,
          banner: "You're viewing a sample summary.",
        }
      : { phase: "loading" },
  );
  const started = useRef(false);

  // Kick off summarization on mount.
  useEffect(() => {
    if (id.startsWith("example-") || started.current) return;
    started.current = true;

    (async () => {
      try {
        const res = await fetch("/api/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ youtubeId: id }),
        });
        const json = await res.json();

        if (res.ok && json.ok && json.mode === "job") {
          setState({
            phase: "job",
            summaryId: json.summaryId,
            metadata: json.metadata,
            progress: 0,
            step: "Queued",
          });
          return;
        }

        if (res.ok && json.ok) {
          setState({
            phase: "done",
            metadata: json.metadata,
            content: json.content,
            cached: json.cached,
          });
          return;
        }

        if (json.code === "NOT_CONFIGURED") {
          setState({
            phase: "done",
            metadata: { ...SAMPLE_METADATA, youtubeId: id },
            content: SAMPLE_SUMMARY,
            banner:
              "Demo summary — add GEMINI_API_KEY to summarize real videos.",
          });
          return;
        }

        setState({ phase: "error", message: json.error, code: json.code });
      } catch {
        setState({
          phase: "error",
          message: "Network error. Please try again.",
          code: "NETWORK_ERROR",
        });
      }
    })();
  }, [id]);

  // Poll progress while a background job is running.
  const summaryId = state.phase === "job" ? state.summaryId : null;
  useEffect(() => {
    if (!summaryId) return;
    let active = true;

    const poll = async () => {
      try {
        const res = await fetch(`/api/summarize/status?id=${summaryId}`);
        const json = await res.json();
        if (!active || !json.ok) return;

        if (json.status === "completed" && json.content) {
          setState({
            phase: "done",
            metadata: json.metadata,
            content: json.content,
          });
        } else if (json.status === "failed") {
          setState({
            phase: "error",
            message: json.errorMessage ?? "Summarization failed.",
            code: "JOB_FAILED",
          });
        } else {
          setState((prev) =>
            prev.phase === "job"
              ? {
                  ...prev,
                  progress: json.progress ?? prev.progress,
                  step: json.currentStep ?? prev.step,
                  metadata: json.metadata ?? prev.metadata,
                }
              : prev,
          );
        }
      } catch {
        /* keep polling */
      }
    };

    poll();
    const interval = setInterval(poll, 2000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [summaryId]);

  if (state.phase === "loading") {
    return <ProcessingState thumbnailUrl={thumbnailUrl(id)} />;
  }
  if (state.phase === "job") {
    return (
      <ProcessingState
        title={state.metadata.title}
        channel={state.metadata.channelName}
        thumbnailUrl={state.metadata.thumbnailUrl || thumbnailUrl(id)}
        progress={state.progress}
        step={state.step}
      />
    );
  }
  if (state.phase === "error") {
    return <ErrorState message={state.message} code={state.code} />;
  }
  return (
    <SummaryView
      metadata={state.metadata}
      content={state.content}
      cached={state.cached}
      banner={state.banner}
    />
  );
}
