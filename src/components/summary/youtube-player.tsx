"use client";

import { formatTimestamp } from "@/lib/utils";

interface YouTubePlayerProps {
  videoId: string;
  /** Seconds to start/seek to. Changing this reloads the player at that point. */
  startAt: number;
}

/**
 * Lightweight embedded player. We avoid the full YouTube IFrame API by
 * remounting the iframe with a new `start` param whenever the user seeks —
 * simple, dependency-free, and reliable.
 */
export function YouTubePlayer({ videoId, startAt }: YouTubePlayerProps) {
  const autoplay = startAt > 0 ? "&autoplay=1" : "";
  const src = `https://www.youtube-nocookie.com/embed/${videoId}?start=${Math.floor(
    startAt,
  )}${autoplay}&rel=0`;

  return (
    <div>
      <div className="relative aspect-video overflow-hidden rounded-card border border-border bg-black">
        <iframe
          key={startAt}
          src={src}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
      <p className="mt-2 font-mono text-xs text-text-tertiary">
        Now playing: {formatTimestamp(startAt)}
      </p>
    </div>
  );
}
