"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Loader2, Send, Sparkles, X } from "lucide-react";
import type { QaMessage, SummaryContent, VideoMetadata } from "@/lib/types";
import { cn, formatTimestamp } from "@/lib/utils";

interface QaPanelProps {
  metadata: VideoMetadata;
  content: SummaryContent;
  open: boolean;
  onClose: () => void;
  onSeek: (seconds: number) => void;
}

const SUGGESTIONS = [
  "What's the main thesis?",
  "Do LLMs replace programmers?",
  "What's the most surprising claim?",
  "Best moments to share?",
];

/** Render answer text, turning [seconds] tokens into clickable citations. */
function renderWithCitations(
  text: string,
  onSeek: (s: number) => void,
): ReactNode[] {
  const parts: ReactNode[] = [];
  const re = /\[(\d{1,6})\]/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const seconds = parseInt(m[1], 10);
    parts.push(
      <button
        key={`c${key++}`}
        onClick={() => onSeek(seconds)}
        className="mx-0.5 inline-flex rounded-pill bg-surface-2 px-1.5 py-0.5 align-baseline font-mono text-xs text-accent transition-colors hover:bg-accent/10"
        title="Jump to this moment"
      >
        {formatTimestamp(seconds)}
      </button>,
    );
    last = re.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export function QaPanel({
  metadata,
  content,
  open,
  onClose,
  onSeek,
}: QaPanelProps) {
  const [messages, setMessages] = useState<QaMessage[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const storageKey = `tubesynth:qa:${metadata.youtubeId}`;
  const loaded = useRef(false);

  // Restore any saved conversation for this video (survives reloads).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      // Hydrating state from an external store (localStorage) on mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setMessages(JSON.parse(raw) as QaMessage[]);
    } catch {
      // ignore malformed/unavailable storage
    }
    loaded.current = true;
  }, [storageKey]);

  // Persist on every change once the initial load has run.
  useEffect(() => {
    if (!loaded.current) return;
    try {
      if (messages.length === 0) window.localStorage.removeItem(storageKey);
      else window.localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch {
      // ignore quota/availability errors
    }
  }, [messages, storageKey]);

  function clearConversation() {
    setMessages([]);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && open) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, thinking]);

  async function ask(question: string) {
    const q = question.trim();
    if (!q || thinking) return;
    const history = messages;
    setMessages((prev) => [...prev, { role: "user", content: q }]);
    setInput("");
    setThinking(true);
    try {
      const res = await fetch("/api/qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metadata, content, question: q, history }),
      });
      const json = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: json.ok
            ? json.answer
            : (json.error ?? "Something went wrong."),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Network error. Please try again." },
      ]);
    } finally {
      setThinking(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-black/30 transition-opacity duration-200",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      {/* Panel */}
      <aside
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-[480px] flex-col border-l border-border bg-surface transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
        aria-hidden={!open}
      >
        {/* Header */}
        <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div className="flex min-w-0 items-center gap-2">
            <Sparkles className="h-4 w-4 shrink-0 text-accent" />
            <p className="truncate text-sm text-text-secondary">
              Q&amp;A about{" "}
              <span className="font-serif italic text-text-primary">
                {metadata.title}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-base p-1 text-text-tertiary transition-colors hover:text-text-primary"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* Body */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-6">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <Sparkles className="h-6 w-6 text-accent" />
              <h2 className="mt-4 font-serif text-xl text-text-primary">
                Ask anything about this video
              </h2>
              <p className="mt-2 text-sm text-text-secondary">
                I&apos;ll answer with exact timestamps so you can verify.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => ask(s)}
                    className="rounded-pill border border-border px-3 py-1.5 text-sm text-text-secondary transition-colors hover:border-accent hover:text-text-primary"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {messages.map((m, i) =>
                m.role === "user" ? (
                  <div key={i} className="flex justify-end">
                    <p className="max-w-[85%] rounded-card rounded-br-sm bg-surface-2 px-4 py-2.5 text-[15px] text-text-primary">
                      {m.content}
                    </p>
                  </div>
                ) : (
                  <p
                    key={i}
                    className="text-[15px] leading-[1.7] text-text-primary"
                  >
                    {renderWithCitations(m.content, onSeek)}
                  </p>
                ),
              )}
              {thinking ? (
                <p className="flex items-center gap-2 text-sm italic text-text-tertiary">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  thinking…
                </p>
              ) : null}
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="border-t border-border p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
            className="flex items-end gap-2 rounded-card border border-border bg-background p-2 focus-within:border-accent"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (
                  (e.metaKey || e.ctrlKey) &&
                  e.key === "Enter"
                ) {
                  e.preventDefault();
                  ask(input);
                }
              }}
              rows={1}
              placeholder={messages.length ? "Ask a follow-up…" : "Ask a question…"}
              className="max-h-28 flex-1 resize-none bg-transparent px-2 py-1.5 text-[15px] text-text-primary placeholder:text-text-tertiary outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || thinking}
              className="rounded-base bg-accent p-2 text-accent-contrast transition-opacity hover:bg-accent-hover disabled:opacity-30"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
          <div className="mt-1.5 flex items-center justify-between px-1 text-xs text-text-tertiary">
            <span>Cmd+Enter to send · Esc to close</span>
            {messages.length > 0 ? (
              <button
                onClick={clearConversation}
                className="transition-colors hover:text-text-primary"
              >
                Clear conversation
              </button>
            ) : null}
          </div>
        </div>
      </aside>
    </>
  );
}
