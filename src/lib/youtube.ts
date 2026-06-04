/**
 * YouTube URL parsing & validation.
 * Supports: youtube.com/watch?v=, youtu.be/, youtube.com/shorts/,
 * youtube.com/embed/, with or without extra query params (timestamps, lists).
 */

const YOUTUBE_ID_RE = /^[a-zA-Z0-9_-]{11}$/;

/** Extract the 11-character video id from any supported YouTube URL or raw id. */
export function extractYouTubeId(input: string): string | null {
  const value = input.trim();
  if (!value) return null;

  // Already a bare video id.
  if (YOUTUBE_ID_RE.test(value)) return value;

  let url: URL;
  try {
    url = new URL(value.includes("://") ? value : `https://${value}`);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "");

  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    return YOUTUBE_ID_RE.test(id) ? id : null;
  }

  if (
    host === "youtube.com" ||
    host === "m.youtube.com" ||
    host === "music.youtube.com"
  ) {
    // /watch?v=ID
    const v = url.searchParams.get("v");
    if (v && YOUTUBE_ID_RE.test(v)) return v;

    // /shorts/ID, /embed/ID, /live/ID, /v/ID
    const match = url.pathname.match(
      /^\/(?:shorts|embed|live|v)\/([a-zA-Z0-9_-]{11})/,
    );
    if (match) return match[1];
  }

  return null;
}

/** True if the input resolves to a valid YouTube video id. */
export function isValidYouTubeUrl(input: string): boolean {
  return extractYouTubeId(input) !== null;
}

/** Canonical watch URL for a video id. */
export function watchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

/** Privacy-friendly embed URL (no cookies) for a video id. */
export function embedUrl(videoId: string, startSeconds?: number): string {
  const base = `https://www.youtube-nocookie.com/embed/${videoId}`;
  return startSeconds ? `${base}?start=${Math.floor(startSeconds)}` : base;
}

/** Thumbnail URL for a video id. */
export function thumbnailUrl(
  videoId: string,
  quality: "default" | "mq" | "hq" | "sd" | "maxres" = "hq",
): string {
  const map = {
    default: "default",
    mq: "mqdefault",
    hq: "hqdefault",
    sd: "sddefault",
    maxres: "maxresdefault",
  } as const;
  return `https://i.ytimg.com/vi/${videoId}/${map[quality]}.jpg`;
}
