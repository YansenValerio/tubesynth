"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Copy,
  Download,
  Link2,
  MessageSquare,
} from "lucide-react";
import type {
  Importance,
  SummaryContent,
  VideoMetadata,
} from "@/lib/types";
import { cn, formatDuration, formatTimestamp } from "@/lib/utils";
import { summaryToMarkdown } from "@/lib/export";
import { languageLabel } from "@/lib/i18n";
import { Timestamp } from "./timestamp";
import { YouTubePlayer } from "./youtube-player";
import { QaPanel } from "./qa-panel";
import { LanguageSwitcher } from "./language-switcher";

interface SummaryViewProps {
  metadata: VideoMetadata;
  content: SummaryContent;
  cached?: boolean;
  processingNote?: string;
  banner?: string;
  /** Read-only public share view with conversion CTAs (Design §7.2). */
  shareMode?: boolean;
}

type TabId = "overview" | "chapters" | "points" | "quotes" | "actions";

export function SummaryView({
  metadata,
  content,
  processingNote,
  banner,
  shareMode = false,
}: SummaryViewProps) {
  const [tab, setTab] = useState<TabId>("overview");
  const [startAt, setStartAt] = useState(0);
  const [qaOpen, setQaOpen] = useState(false);

  // Translation state. The source language's content is cached up front so
  // switching back is instant; other languages are fetched on demand.
  const sourceLang = metadata.language ?? "en";
  const [lang, setLang] = useState(sourceLang);
  const [displayContent, setDisplayContent] = useState(content);
  const [translating, setTranslating] = useState(false);
  const [translateNote, setTranslateNote] = useState<string | null>(null);
  const translationCache = useRef<Map<string, SummaryContent>>(
    new Map([[sourceLang, content]]),
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setQaOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function seek(seconds: number) {
    setStartAt(seconds);
    setQaOpen(false);
  }

  async function selectLanguage(code: string) {
    if (code === lang || translating) return;
    setTranslateNote(null);

    const cached = translationCache.current.get(code);
    if (cached) {
      setLang(code);
      setDisplayContent(cached);
      return;
    }

    setTranslating(true);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metadata,
          content: translationCache.current.get(sourceLang) ?? content,
          targetLanguage: code,
        }),
      });
      const json = await res.json();
      if (json.ok && json.content) {
        if (json.demo) {
          setTranslateNote(
            "Translation needs GEMINI_API_KEY — showing the original.",
          );
        } else {
          translationCache.current.set(code, json.content);
        }
        setLang(code);
        setDisplayContent(json.content);
      } else {
        setTranslateNote(json.error ?? "Couldn't translate. Try again.");
      }
    } catch {
      setTranslateNote("Network error while translating.");
    } finally {
      setTranslating(false);
    }
  }

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: "overview", label: "Overview" },
    { id: "chapters", label: "Chapters", count: displayContent.chapters.length },
    { id: "points", label: "Key Points", count: displayContent.keyPoints.length },
    { id: "quotes", label: "Quotes", count: displayContent.keyQuotes.length },
    { id: "actions", label: "Action Items", count: displayContent.actionItems.length },
  ];

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          {shareMode ? (
            <span className="w-24" />
          ) : (
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          )}
          <Link href="/" className="font-serif text-lg">
            Tube<span className="text-accent">Synth</span>
          </Link>
          {shareMode ? (
            <Link
              href="/"
              className="rounded-pill bg-accent px-4 py-1.5 text-sm font-medium text-accent-contrast transition-colors hover:bg-accent-hover"
            >
              Make your own →
            </Link>
          ) : (
            <Link
              href="/dashboard"
              className="text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              Account
            </Link>
          )}
        </div>
      </header>

      {shareMode ? (
        <div className="border-b border-accent/20 bg-accent/10 px-6 py-2.5 text-center text-sm text-text-secondary">
          💡 You&apos;re viewing a shared summary.{" "}
          <Link href="/" className="font-medium text-accent hover:underline">
            Create your own →
          </Link>
        </div>
      ) : banner ? (
        <div className="border-b border-accent/20 bg-accent/10 px-6 py-2.5 text-center text-sm text-text-secondary">
          {banner}
        </div>
      ) : null}

      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-10 lg:grid-cols-[1fr_320px]">
        {/* Main column */}
        <main className="min-w-0 max-w-[680px]">
          <p className="text-xs uppercase tracking-wide text-text-tertiary">
            {metadata.channelName}
          </p>
          <h1 className="mt-2 font-serif text-[32px] leading-tight text-text-primary">
            {metadata.title}
          </h1>
          <p className="mt-3 text-sm text-text-tertiary">
            {formatDuration(metadata.durationSeconds)}
            {processingNote ? ` · ${processingNote}` : ""}
          </p>

          {/* Tabs */}
          <nav className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-b border-border">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "relative -mb-px border-b-2 pb-3 text-sm transition-colors",
                  tab === t.id
                    ? "border-accent font-medium text-text-primary"
                    : "border-transparent text-text-secondary hover:text-text-primary",
                )}
              >
                {t.label}
                {t.count != null ? (
                  <span className="ml-1.5 text-text-tertiary">{t.count}</span>
                ) : null}
              </button>
            ))}
          </nav>

          <div className="py-8">
            {tab === "overview" && <OverviewPanel content={displayContent} />}
            {tab === "chapters" && (
              <ChaptersPanel content={displayContent} onSeek={setStartAt} />
            )}
            {tab === "points" && (
              <PointsPanel content={displayContent} onSeek={setStartAt} />
            )}
            {tab === "quotes" && (
              <QuotesPanel content={displayContent} onSeek={setStartAt} />
            )}
            {tab === "actions" && <ActionsPanel content={displayContent} />}
          </div>
        </main>

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-20 lg:h-fit">
          <YouTubePlayer videoId={metadata.youtubeId} startAt={startAt} />

          <div className="mt-5 rounded-card border border-border bg-surface p-4 text-sm">
            <Meta label="Reading time" value={`~${displayContent.estimatedReadTime ?? 1} min`} />
            <Meta label="Language" value={languageLabel(lang)} />
            <Meta label="Chapters" value={String(displayContent.chapters.length)} />
          </div>

          <div className="mt-3">
            <LanguageSwitcher
              current={lang}
              loading={translating}
              onSelect={selectLanguage}
            />
            {translateNote ? (
              <p className="mt-1.5 text-xs text-text-tertiary">{translateNote}</p>
            ) : null}
          </div>

          {displayContent.topics.length > 0 && (
            <div className="mt-5">
              <h3 className="mb-2 text-xs uppercase tracking-wide text-text-tertiary">
                Topics covered
              </h3>
              <div className="flex flex-wrap gap-2">
                {displayContent.topics.map((topic) => (
                  <span
                    key={topic}
                    className="rounded-pill border border-border px-2.5 py-1 text-xs text-text-secondary"
                  >
                    #{topic.replace(/\s+/g, "")}
                  </span>
                ))}
              </div>
            </div>
          )}

          <Toolbar
            metadata={metadata}
            content={displayContent}
            onOpenQa={() => setQaOpen(true)}
          />
        </aside>
      </div>

      <QaPanel
        metadata={metadata}
        content={displayContent}
        open={qaOpen}
        onClose={() => setQaOpen(false)}
        onSeek={seek}
      />

      {shareMode ? (
        <footer className="border-t border-border/60 px-6 py-12 text-center">
          <p className="font-serif text-xl text-text-primary">
            TubeSynth helps you read any YouTube video.
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex rounded-pill bg-accent px-5 py-2.5 text-sm font-medium text-accent-contrast transition-colors hover:bg-accent-hover"
          >
            Try it free →
          </Link>
        </footer>
      ) : null}
    </div>
  );
}

/* ── Panels ──────────────────────────────────────────────────── */

function OverviewPanel({ content }: { content: SummaryContent }) {
  return (
    <article className="space-y-6">
      <section>
        <h2 className="font-serif text-xl italic text-text-secondary">TL;DR</h2>
        <p className="mt-2 text-[18px] leading-[1.7] text-text-primary">
          {content.tldr}
        </p>
      </section>
      <hr className="border-border" />
      <section>
        <h2 className="font-serif text-xl text-text-primary">Overview</h2>
        <div className="mt-3 space-y-4 text-[17px] leading-[1.75] text-text-secondary">
          {content.overview.split(/\n\n+/).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </section>
    </article>
  );
}

function ChaptersPanel({
  content,
  onSeek,
}: {
  content: SummaryContent;
  onSeek: (s: number) => void;
}) {
  return (
    <div className="space-y-1">
      {content.chapters.map((c, i) => (
        <button
          key={i}
          onClick={() => onSeek(c.startTime)}
          className="group block w-full rounded-base px-3 py-4 text-left transition-colors hover:bg-surface"
        >
          <span className="font-mono text-xs text-accent">
            {formatTimestamp(c.startTime)} — {formatTimestamp(c.endTime)}
          </span>
          <h3 className="mt-1 font-serif text-lg text-text-primary">{c.title}</h3>
          <p className="mt-1.5 text-[15px] leading-relaxed text-text-secondary">
            {c.summary}
          </p>
        </button>
      ))}
    </div>
  );
}

function PointsPanel({
  content,
  onSeek,
}: {
  content: SummaryContent;
  onSeek: (s: number) => void;
}) {
  const [sort, setSort] = useState<"importance" | "time">("importance");
  const order: Record<Importance, number> = { high: 0, medium: 1, low: 2 };
  const points = [...content.keyPoints].sort((a, b) =>
    sort === "time"
      ? a.timestamp - b.timestamp
      : order[a.importance] - order[b.importance],
  );

  return (
    <div>
      <div className="mb-4 flex gap-2 text-xs">
        {(["importance", "time"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSort(s)}
            className={cn(
              "rounded-pill px-3 py-1 transition-colors",
              sort === s
                ? "bg-surface-2 text-text-primary"
                : "text-text-tertiary hover:text-text-secondary",
            )}
          >
            {s === "importance" ? "By importance" : "Chronological"}
          </button>
        ))}
      </div>
      <ul className="space-y-3">
        {points.map((p, i) => (
          <li key={i} className="flex items-start gap-3">
            <Timestamp seconds={p.timestamp} onSeek={onSeek} />
            <ImportanceDot importance={p.importance} />
            <span className="text-[15px] leading-relaxed text-text-primary">
              {p.point}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function QuotesPanel({
  content,
  onSeek,
}: {
  content: SummaryContent;
  onSeek: (s: number) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {content.keyQuotes.map((q, i) => (
        <figure
          key={i}
          className="rounded-card border border-border bg-surface p-5"
        >
          <span className="font-serif text-3xl leading-none text-accent">“</span>
          <blockquote className="mt-1 font-serif text-[17px] italic leading-relaxed text-text-primary">
            {q.quote}
          </blockquote>
          <figcaption className="mt-3 flex items-center justify-between text-xs text-text-tertiary">
            <span>{q.speaker ?? "Unknown"}</span>
            <Timestamp seconds={q.timestamp} onSeek={onSeek} />
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

function ActionsPanel({ content }: { content: SummaryContent }) {
  const [done, setDone] = useState<Set<number>>(new Set());
  function toggle(i: number) {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }
  return (
    <ul className="space-y-2">
      {content.actionItems.map((item, i) => {
        const checked = done.has(i);
        return (
          <li key={i}>
            <button
              onClick={() => toggle(i)}
              className="flex w-full items-start gap-3 rounded-base px-3 py-3 text-left transition-colors hover:bg-surface"
            >
              <span
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-base border transition-colors",
                  checked
                    ? "border-accent bg-accent text-accent-contrast"
                    : "border-border",
                )}
              >
                {checked ? <Check className="h-3.5 w-3.5" /> : null}
              </span>
              <span
                className={cn(
                  "text-[15px] leading-relaxed",
                  checked
                    ? "text-text-tertiary line-through"
                    : "text-text-primary",
                )}
              >
                {item}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/* ── Bits ────────────────────────────────────────────────────── */

function ImportanceDot({ importance }: { importance: Importance }) {
  return (
    <span
      title={`${importance} importance`}
      className={cn(
        "mt-1.5 h-2 w-2 shrink-0 rounded-full",
        importance === "high" && "bg-accent",
        importance === "medium" && "bg-accent/50",
        importance === "low" && "border border-text-tertiary",
      )}
    />
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-text-tertiary">{label}</span>
      <span className="text-text-primary">{value}</span>
    </div>
  );
}

function Toolbar({
  metadata,
  content,
  onOpenQa,
}: {
  metadata: VideoMetadata;
  content: SummaryContent;
  onOpenQa: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [linked, setLinked] = useState(false);

  async function copyMarkdown() {
    await navigator.clipboard.writeText(summaryToMarkdown(metadata, content));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  function downloadMarkdown() {
    const blob = new Blob([summaryToMarkdown(metadata, content)], {
      type: "text/markdown",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${metadata.title.slice(0, 60).replace(/[^\w]+/g, "-")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copyLink() {
    let url = window.location.href;
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          youtubeId: metadata.youtubeId,
          language: metadata.language ?? "en",
        }),
      });
      const json = await res.json();
      if (json.ok && json.path) url = `${window.location.origin}${json.path}`;
    } catch {
      // fall back to the current URL
    }
    await navigator.clipboard.writeText(url);
    setLinked(true);
    setTimeout(() => setLinked(false), 1800);
  }

  return (
    <div className="mt-5">
      <button
        onClick={onOpenQa}
        className="flex w-full items-center justify-center gap-2 rounded-base bg-accent px-4 py-2.5 text-sm font-medium text-accent-contrast transition-colors hover:bg-accent-hover"
      >
        <MessageSquare className="h-4 w-4" />
        Ask about this video
      </button>
      <div className="mt-2 grid grid-cols-3 gap-2">
        <ToolButton onClick={downloadMarkdown} icon={Download} label="Export" />
        <ToolButton
          onClick={copyMarkdown}
          icon={copied ? Check : Copy}
          label={copied ? "Copied" : "Copy"}
        />
        <ToolButton
          onClick={copyLink}
          icon={linked ? Check : Link2}
          label={linked ? "Copied" : "Share"}
        />
      </div>
    </div>
  );
}

function ToolButton({
  onClick,
  icon: Icon,
  label,
}: {
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 rounded-base border border-border bg-surface px-2 py-2.5 text-xs text-text-secondary transition-colors hover:border-text-tertiary/40 hover:text-text-primary"
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
