"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Globe, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { LANGUAGES } from "@/lib/i18n";

interface LanguageSwitcherProps {
  current: string;
  loading?: boolean;
  onSelect: (code: string) => void;
}

export function LanguageSwitcher({
  current,
  loading,
  onSelect,
}: LanguageSwitcherProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const active = LANGUAGES.find((l) => l.code === current);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={loading}
        className="flex w-full items-center justify-between gap-2 rounded-base border border-border bg-surface px-3 py-2 text-sm text-text-secondary transition-colors hover:text-text-primary disabled:opacity-70"
      >
        <span className="flex items-center gap-2">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-accent" />
          ) : (
            <Globe className="h-4 w-4" />
          )}
          {active?.native ?? current}
        </span>
        <span className="text-xs text-text-tertiary">Translate</span>
      </button>

      {open ? (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-base border border-border bg-surface-2 py-1 shadow-lg">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setOpen(false);
                onSelect(l.code);
              }}
              className={cn(
                "flex w-full items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-surface",
                l.code === current ? "text-text-primary" : "text-text-secondary",
              )}
            >
              {l.native}
              {l.code === current ? (
                <Check className="h-3.5 w-3.5 text-accent" />
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
