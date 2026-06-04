"use client";

import { useState } from "react";
import { ArrowRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExamplePoint {
  text: string;
  time: string;
}

interface Example {
  id: string;
  label: string;
  channel: string;
  title: string;
  duration: string;
  tldr: string;
  points: ExamplePoint[];
}

const EXAMPLES: Example[] = [
  {
    id: "lex",
    label: "Lex Fridman Podcast",
    channel: "Lex Fridman Podcast",
    title: "Andrej Karpathy: Software in the Era of AI",
    duration: "3h 42m",
    tldr: "Karpathy argues natural language is becoming the new programming interface, shifting the engineer's role from writing code to orchestrating systems — without removing the need for deep technical fundamentals.",
    points: [
      { text: "Natural language is the new programming language", time: "14:32" },
      { text: "The role of a programmer shifts toward orchestration", time: "28:45" },
      { text: "Democratization increases — not eliminates — the need for fundamentals", time: "1:12:08" },
    ],
  },
  {
    id: "karpathy",
    label: "Andrej Karpathy Lecture",
    channel: "Andrej Karpathy",
    title: "Let's build the GPT Tokenizer",
    duration: "2h 13m",
    tldr: "A from-scratch walkthrough of byte-pair encoding: why tokenization sits behind many LLM quirks, and how to implement a working tokenizer step by step.",
    points: [
      { text: "Tokenization explains many surprising LLM failures", time: "03:21" },
      { text: "Byte-pair encoding, built up from raw bytes", time: "41:10" },
      { text: "Special tokens and the GPT-4 vocabulary", time: "1:38:52" },
    ],
  },
  {
    id: "aws",
    label: "AWS re:Invent Keynote",
    channel: "AWS Events",
    title: "AWS re:Invent 2025 — Keynote",
    duration: "2h 15m",
    tldr: "The keynote centers on agentic AI infrastructure: new managed services for orchestration, cheaper inference tiers, and tighter data-to-model pipelines.",
    points: [
      { text: "New managed agent orchestration service announced", time: "22:05" },
      { text: "Inference cost reductions across the Bedrock lineup", time: "58:40" },
      { text: "Zero-ETL expansions for analytics workloads", time: "1:44:18" },
    ],
  },
];

export function ExampleTabs() {
  const [active, setActive] = useState(EXAMPLES[0].id);
  const example = EXAMPLES.find((e) => e.id === active)!;

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {EXAMPLES.map((e) => (
          <button
            key={e.id}
            onClick={() => setActive(e.id)}
            className={cn(
              "rounded-pill border px-4 py-2 text-sm transition-colors duration-200",
              active === e.id
                ? "border-accent bg-accent/10 text-text-primary"
                : "border-border text-text-secondary hover:text-text-primary",
            )}
          >
            {e.label}
          </button>
        ))}
      </div>

      <div className="rounded-card border border-border bg-surface p-6 sm:p-8">
        <p className="text-xs uppercase tracking-wide text-text-tertiary">
          {example.channel}
        </p>
        <h3 className="mt-1 font-serif text-2xl text-text-primary">
          {example.title}
        </h3>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-text-tertiary">
          <Clock className="h-3.5 w-3.5" />
          {example.duration}
        </p>

        <div className="mt-6">
          <p className="font-serif italic text-text-secondary">TL;DR</p>
          <p className="mt-2 text-[17px] leading-relaxed text-text-primary">
            {example.tldr}
          </p>
        </div>

        <div className="mt-6 space-y-3 border-t border-border pt-6">
          {example.points.map((p) => (
            <div key={p.time} className="flex items-start gap-3">
              <span className="mt-0.5 shrink-0 rounded-pill bg-surface-2 px-2 py-0.5 font-mono text-xs text-accent">
                {p.time}
              </span>
              <span className="text-[15px] leading-relaxed text-text-secondary">
                {p.text}
              </span>
            </div>
          ))}
        </div>

        <a
          href={`/summary/example-${example.id}`}
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-accent transition-colors hover:text-accent-hover"
        >
          See full summary
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
