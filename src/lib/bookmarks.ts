import type { PatternId } from "@/lib/patterns";

export type BookmarkEntry = {
  id: string;
  patternId: PatternId;
  itemKey: string;
  itemTitleJa: string;
  addedAt: number;
};

const STORAGE_KEY = "speaking-practice-bookmarks";
const MAX_ENTRIES = 50;

function readRaw(): BookmarkEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as BookmarkEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRaw(entries: BookmarkEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
}

export function loadBookmarks(): BookmarkEntry[] {
  return readRaw().sort((a, b) => b.addedAt - a.addedAt);
}

export function isBookmarked(patternId: PatternId, itemKey: string): boolean {
  return readRaw().some((item) => item.patternId === patternId && item.itemKey === itemKey);
}

export function toggleBookmark(
  entry: Omit<BookmarkEntry, "id" | "addedAt">
): { bookmarked: true; entry: BookmarkEntry } | { bookmarked: false } {
  const entries = readRaw();
  const existingIndex = entries.findIndex(
    (item) => item.patternId === entry.patternId && item.itemKey === entry.itemKey
  );

  if (existingIndex >= 0) {
    writeRaw(entries.filter((_, index) => index !== existingIndex));
    return { bookmarked: false };
  }

  const newEntry: BookmarkEntry = {
    ...entry,
    id: crypto.randomUUID(),
    addedAt: Date.now(),
  };
  writeRaw([newEntry, ...entries]);
  return { bookmarked: true, entry: newEntry };
}

export function removeBookmark(id: string) {
  writeRaw(readRaw().filter((item) => item.id !== id));
}
