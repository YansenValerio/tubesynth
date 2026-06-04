"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "Is it really free?",
    a: "Yes. TubeSynth is free for personal use, no signup required. We cache aggressively and use efficient models, so individual summaries cost a fraction of a cent to produce.",
  },
  {
    q: "How does it handle very long videos?",
    a: "For videos under two hours we summarize in a single pass. Longer videos are split into chunks, summarized in parallel, then synthesized into one coherent summary — so even a 12-hour recording stays accurate and readable.",
  },
  {
    q: "What about videos without captions?",
    a: "We rely on YouTube's transcript — either creator-provided captions or auto-generated ones. If neither exists, we'll tell you clearly rather than guessing. Audio transcription is on the roadmap.",
  },
  {
    q: "Can I use it for commercial purposes?",
    a: "TubeSynth is intended for personal research and learning. You provide the URL; we never rehost the underlying video. Please respect the original creator's rights and YouTube's terms.",
  },
  {
    q: "Is my data private?",
    a: "We only process public videos and store summaries to power caching and your history. We don't sell personal data, and you can use the product anonymously.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-border border-y border-border">
      {FAQS.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 py-5 text-left"
              aria-expanded={isOpen}
            >
              <span className="text-[17px] text-text-primary">{item.q}</span>
              <Plus
                className={cn(
                  "h-5 w-5 shrink-0 text-text-tertiary transition-transform duration-200",
                  isOpen && "rotate-45 text-accent",
                )}
              />
            </button>
            <div
              className={cn(
                "grid transition-all duration-200 ease-out",
                isOpen
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <p className="max-w-2xl pb-5 leading-relaxed text-text-secondary">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
