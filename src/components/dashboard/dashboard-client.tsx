"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bookmark, LayoutGrid, List, LogOut, Search, X } from "lucide-react";
import type { SummaryListItem } from "@/lib/history";
import type { Folder } from "@/lib/folders";
import {
  cn,
  formatDuration,
  formatRelativeTime,
} from "@/lib/utils";
import { UrlInput } from "@/components/url-input";
import { FolderMenu } from "./folder-menu";

interface DashboardClientProps {
  name: string;
  summaries: SummaryListItem[];
  folders: Folder[];
}

type Filter = "all" | "recent" | "favorites";
type ViewMode = "grid" | "list";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function DashboardClient({
  name,
  summaries,
  folders: initialFolders,
}: DashboardClientProps) {
  const [items, setItems] = useState(summaries);
  const [folders, setFolders] = useState(initialFolders);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>("grid");
  // Stable "now" captured once at mount (avoids impure Date.now() in render).
  const [now] = useState(() => Date.now());

  function recountFolders(list: SummaryListItem[]) {
    setFolders((prev) =>
      prev.map((f) => ({
        ...f,
        count: list.filter((i) => i.folderId === f.id).length,
      })),
    );
  }

  async function assignFolder(summaryId: string, folderId: string | null) {
    const prevItems = items;
    const nextItems = items.map((i) =>
      i.id === summaryId ? { ...i, folderId } : i,
    );
    setItems(nextItems);
    recountFolders(nextItems);
    try {
      const res = await fetch("/api/folders/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summaryId, folderId }),
      });
      if (!(await res.json()).ok) throw new Error();
    } catch {
      setItems(prevItems);
      recountFolders(prevItems);
    }
  }

  async function createFolderAndAssign(summaryId: string, name: string) {
    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const json = await res.json();
      if (!json.ok) return;
      setFolders((prev) => [...prev, json.folder]);
      await assignFolder(summaryId, json.folder.id);
    } catch {
      // ignore
    }
  }

  async function deleteFolder(folderId: string) {
    const prevFolders = folders;
    const prevItems = items;
    setFolders((prev) => prev.filter((f) => f.id !== folderId));
    setItems((prev) =>
      prev.map((i) => (i.folderId === folderId ? { ...i, folderId: null } : i)),
    );
    if (activeFolder === folderId) setActiveFolder(null);
    try {
      const res = await fetch(`/api/folders?id=${folderId}`, {
        method: "DELETE",
      });
      if (!(await res.json()).ok) throw new Error();
    } catch {
      setFolders(prevFolders);
      setItems(prevItems);
    }
  }

  async function toggleFavorite(id: string) {
    const target = items.find((i) => i.id === id);
    if (!target) return;
    const next = !target.isFavorite;
    // Optimistic update; revert on failure.
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, isFavorite: next } : i)),
    );
    try {
      const res = await fetch("/api/favorite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summaryId: id, value: next }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error();
    } catch {
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, isFavorite: !next } : i)),
      );
    }
  }

  const hoursSaved = useMemo(
    () => Math.round(items.reduce((s, v) => s + v.durationSeconds, 0) / 3600),
    [items],
  );
  const thisWeek = useMemo(
    () =>
      items.filter(
        (s) => s.completedAt && now - new Date(s.completedAt).getTime() < WEEK_MS,
      ).length,
    [items, now],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((s) => {
      if (activeFolder !== null && s.folderId !== activeFolder) return false;
      if (filter === "favorites" && !s.isFavorite) return false;
      if (
        filter === "recent" &&
        !(s.completedAt && now - new Date(s.completedAt).getTime() < WEEK_MS)
      )
        return false;
      if (!q) return true;
      return (
        s.title.toLowerCase().includes(q) ||
        s.channelName.toLowerCase().includes(q)
      );
    });
  }, [items, query, filter, activeFolder, now]);

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="font-serif text-xl">
            Tube<span className="text-accent">Synth</span>
          </Link>
          <form action="/auth/signout" method="post">
            <button className="inline-flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary">
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <p className="text-sm text-text-secondary">Welcome back, {name}</p>

        {/* Stats */}
        <div className="mt-4 flex flex-wrap gap-x-10 gap-y-4">
          <Stat value={String(items.length)} label="summaries" />
          <Stat value={`${hoursSaved}`} label="hours saved" />
          <Stat value={`${thisWeek}`} label="this week" />
        </div>

        {/* New summary */}
        <div className="mt-8 max-w-2xl">
          <UrlInput size="md" />
        </div>

        {/* Filters */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-1">
            {(["all", "recent", "favorites"] as const).map((f) => (
              <button
                key={f}
                onClick={() => {
                  setFilter(f);
                  setActiveFolder(null);
                }}
                className={cn(
                  "rounded-pill px-3 py-1.5 text-sm capitalize transition-colors",
                  filter === f && activeFolder === null
                    ? "bg-surface-2 text-text-primary"
                    : "text-text-secondary hover:text-text-primary",
                )}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-pill border border-border bg-surface px-3 py-1.5">
              <Search className="h-4 w-4 text-text-tertiary" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search your summaries…"
                className="w-44 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none"
              />
            </div>
            <div className="flex rounded-pill border border-border">
              <ViewToggle active={view === "grid"} onClick={() => setView("grid")}>
                <LayoutGrid className="h-4 w-4" />
              </ViewToggle>
              <ViewToggle active={view === "list"} onClick={() => setView("list")}>
                <List className="h-4 w-4" />
              </ViewToggle>
            </div>
          </div>
        </div>

        {/* Folders bar */}
        {folders.length > 0 ? (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-wide text-text-tertiary">
              Folders
            </span>
            {folders.map((f) => (
              <span
                key={f.id}
                className={cn(
                  "group inline-flex items-center gap-1.5 rounded-pill border px-3 py-1 text-sm transition-colors",
                  activeFolder === f.id
                    ? "border-accent bg-accent/10 text-text-primary"
                    : "border-border text-text-secondary hover:text-text-primary",
                )}
              >
                <button
                  onClick={() =>
                    setActiveFolder((cur) => (cur === f.id ? null : f.id))
                  }
                >
                  {f.name}
                  <span className="ml-1.5 text-text-tertiary">{f.count}</span>
                </button>
                <button
                  onClick={() => deleteFolder(f.id)}
                  aria-label={`Delete folder ${f.name}`}
                  className="text-text-tertiary opacity-0 transition-opacity hover:text-danger group-hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        ) : null}

        {/* Content */}
        {items.length === 0 ? (
          <EmptyState />
        ) : visible.length === 0 ? (
          <p className="mt-16 text-center text-text-tertiary">
            {activeFolder !== null
              ? "This folder is empty — move summaries in with the folder icon."
              : filter === "favorites"
                ? "No favorites yet — tap the bookmark on any summary."
                : "No summaries match your search."}
          </p>
        ) : view === "grid" ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((s) => (
              <GridCard
                key={s.id}
                item={s}
                folders={folders}
                onToggleFav={toggleFavorite}
                onAssign={assignFolder}
                onCreateAndAssign={createFolderAndAssign}
              />
            ))}
          </div>
        ) : (
          <div className="mt-8 divide-y divide-border border-y border-border">
            {visible.map((s) => (
              <ListRow
                key={s.id}
                item={s}
                folders={folders}
                onToggleFav={toggleFavorite}
                onAssign={assignFolder}
                onCreateAndAssign={createFolderAndAssign}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <span className="font-serif text-3xl text-text-primary">{value}</span>
      <span className="ml-2 text-sm text-text-tertiary">{label}</span>
    </div>
  );
}

function ViewToggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-2.5 py-1.5 transition-colors first:rounded-l-pill last:rounded-r-pill",
        active ? "text-accent" : "text-text-tertiary hover:text-text-primary",
      )}
    >
      {children}
    </button>
  );
}

interface CardProps {
  item: SummaryListItem;
  folders: Folder[];
  onToggleFav: (id: string) => void;
  onAssign: (summaryId: string, folderId: string | null) => void;
  onCreateAndAssign: (summaryId: string, name: string) => void;
}

function GridCard({
  item,
  folders,
  onToggleFav,
  onAssign,
  onCreateAndAssign,
}: CardProps) {
  return (
    <Link
      href={`/summary/${item.youtubeId}`}
      className="group block overflow-hidden rounded-card border border-border bg-surface transition-colors hover:border-text-tertiary/40"
    >
      <div className="relative aspect-video bg-surface-2">
        {item.thumbnailUrl ? (
          <Image
            src={item.thumbnailUrl}
            alt=""
            fill
            unoptimized
            className="object-cover"
          />
        ) : null}
        <FavButton item={item} onToggleFav={onToggleFav} floating />
      </div>
      <div className="p-4">
        <p className="text-xs text-text-tertiary">{item.channelName}</p>
        <h3 className="mt-1 line-clamp-2 font-serif text-[15px] leading-snug text-text-primary">
          {item.title}
        </h3>
        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-text-tertiary">
            {formatDuration(item.durationSeconds)} ·{" "}
            {formatRelativeTime(item.completedAt)}
          </p>
          <FolderMenu
            folders={folders}
            currentFolderId={item.folderId}
            onAssign={(fid) => onAssign(item.id, fid)}
            onCreateAndAssign={(name) => onCreateAndAssign(item.id, name)}
          />
        </div>
      </div>
    </Link>
  );
}

function ListRow({
  item,
  folders,
  onToggleFav,
  onAssign,
  onCreateAndAssign,
}: CardProps) {
  return (
    <Link
      href={`/summary/${item.youtubeId}`}
      className="flex items-center gap-4 py-3 transition-colors hover:bg-surface"
    >
      <div className="relative h-[45px] w-20 shrink-0 overflow-hidden rounded-base bg-surface-2">
        {item.thumbnailUrl ? (
          <Image
            src={item.thumbnailUrl}
            alt=""
            fill
            unoptimized
            className="object-cover"
          />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[15px] text-text-primary">{item.title}</h3>
        <p className="truncate text-xs text-text-tertiary">{item.channelName}</p>
      </div>
      <p className="shrink-0 text-xs text-text-tertiary">
        {formatDuration(item.durationSeconds)} ·{" "}
        {formatRelativeTime(item.completedAt)}
      </p>
      <FavButton item={item} onToggleFav={onToggleFav} />
      <FolderMenu
        folders={folders}
        currentFolderId={item.folderId}
        onAssign={(fid) => onAssign(item.id, fid)}
        onCreateAndAssign={(name) => onCreateAndAssign(item.id, name)}
      />
    </Link>
  );
}

function FavButton({
  item,
  onToggleFav,
  floating,
}: {
  item: SummaryListItem;
  onToggleFav: (id: string) => void;
  floating?: boolean;
}) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggleFav(item.id);
      }}
      aria-label={item.isFavorite ? "Remove favorite" : "Add favorite"}
      className={cn(
        "transition-colors",
        floating
          ? "absolute right-2 top-2 rounded-full bg-background/70 p-1.5 backdrop-blur-sm"
          : "shrink-0 p-1.5",
        item.isFavorite
          ? "text-accent"
          : "text-text-tertiary hover:text-text-primary",
      )}
    >
      <Bookmark
        className="h-4 w-4"
        fill={item.isFavorite ? "currentColor" : "none"}
      />
    </button>
  );
}

function EmptyState() {
  return (
    <div className="mt-16 flex flex-col items-center text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border text-text-tertiary">
        <Search className="h-5 w-5" />
      </div>
      <h2 className="mt-5 font-serif text-xl text-text-primary">
        No summaries yet
      </h2>
      <p className="mt-2 text-text-secondary">
        Paste any YouTube URL above to get started.
      </p>
    </div>
  );
}
