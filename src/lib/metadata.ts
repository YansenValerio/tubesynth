// Server-side only (network fetch). Runs in Next server routes and the
// Trigger.dev worker — no `server-only` guard so it bundles in both runtimes.
import { thumbnailUrl, watchUrl } from "@/lib/youtube";
import type { VideoMetadata } from "@/lib/types";

interface OEmbedResponse {
  title: string;
  author_name: string;
  thumbnail_url: string;
}

/**
 * Fetch lightweight video metadata via YouTube's public oEmbed endpoint
 * (no API key required). oEmbed does not return duration — callers should
 * derive it from the transcript (last segment end) when needed.
 */
export async function fetchVideoMetadata(
  youtubeId: string,
): Promise<Omit<VideoMetadata, "durationSeconds"> & { durationSeconds: number }> {
  const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(
    watchUrl(youtubeId),
  )}&format=json`;

  const res = await fetch(endpoint, { next: { revalidate: 60 * 60 * 24 } });

  if (res.status === 401 || res.status === 403) {
    throw new MetadataError("This video is private or embedding is disabled.");
  }
  if (res.status === 404) {
    throw new MetadataError("We couldn't find this video. Check the link.");
  }
  if (!res.ok) {
    throw new MetadataError("Couldn't load video details. Try again.");
  }

  const data = (await res.json()) as OEmbedResponse;

  return {
    youtubeId,
    title: data.title,
    channelName: data.author_name,
    thumbnailUrl: data.thumbnail_url || thumbnailUrl(youtubeId, "maxres"),
    durationSeconds: 0, // filled in from transcript
  };
}

export class MetadataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MetadataError";
  }
}
