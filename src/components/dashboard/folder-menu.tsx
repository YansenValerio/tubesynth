"use client";

import { useEffect, useRef, useState } from "react";
import { Check, FolderInput, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Folder } from "@/lib/folders";

interface FolderMenuProps {
  folders: Folder[];
  currentFolderId: string | null;
  onAssign: (folderId: string | null) => void;
  onCreateAndAssign: (name: string) => void;
  floating?: boolean;
}

export function FolderMenu({
  folders,
  currentFolderId,
  onAssign,
  onCreateAndAssign,
  floating,
}: FolderMenuProps) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setCreating(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function close() {
    setOpen(false);
    setCreating(false);
    setName("");
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-label="Move to folder"
        className={cn(
          "transition-colors",
          floating
            ? "rounded-full bg-background/70 p-1.5 backdrop-blur-sm"
            : "p-1.5",
          "text-text-tertiary hover:text-text-primary",
        )}
      >
        <FolderInput className="h-4 w-4" />
      </button>

      {open ? (
        <div
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="absolute right-0 z-30 mt-1 w-52 overflow-hidden rounded-base border border-border bg-surface-2 py-1 shadow-lg"
        >
          <MenuItem
            label="No folder"
            active={currentFolderId === null}
            onClick={() => {
              onAssign(null);
              close();
            }}
          />
          {folders.map((f) => (
            <MenuItem
              key={f.id}
              label={f.name}
              active={currentFolderId === f.id}
              onClick={() => {
                onAssign(f.id);
                close();
              }}
            />
          ))}

          <div className="my-1 border-t border-border" />

          {creating ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (name.trim()) {
                  onCreateAndAssign(name.trim());
                  close();
                }
              }}
              className="px-2 py-1"
            >
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Folder name…"
                className="w-full rounded-base border border-border bg-surface px-2 py-1.5 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent"
              />
            </form>
          ) : (
            <button
              onClick={() => setCreating(true)}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
            >
              <Plus className="h-3.5 w-3.5" />
              New folder
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}

function MenuItem({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between gap-2 px-3 py-2 text-sm transition-colors hover:bg-surface",
        active ? "text-text-primary" : "text-text-secondary",
      )}
    >
      <span className="truncate">{label}</span>
      {active ? <Check className="h-3.5 w-3.5 shrink-0 text-accent" /> : null}
    </button>
  );
}
