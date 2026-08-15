import type { PatternId } from "@/lib/patterns";

export type RetryQueueEntry = {
  id: string;
  patternId: PatternId;
  itemKey: string;
  itemTitleJa: string;
  modelHint: string;
  addedAt: number;
};

const STORAGE_KEY = "speaking-practice-retry-queue";
const MAX_ENTRIES = 30;

function readRaw(): RetryQueueEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RetryQueueEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRaw(entries: RetryQueueEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
}

export function loadRetryQueue(): RetryQueueEntry[] {
  return readRaw().sort((a, b) => b.addedAt - a.addedAt);
}

export function addRetryQueueEntry(
  entry: Omit<RetryQueueEntry, "id" | "addedAt">
): { ok: true; entry: RetryQueueEntry } | { ok: false; reason: "duplicate" } {
  const entries = readRaw();
  const exists = entries.some(
    (item) => item.patternId === entry.patternId && item.itemKey === entry.itemKey
  );
  if (exists) return { ok: false, reason: "duplicate" };

  const newEntry: RetryQueueEntry = {
    ...entry,
    id: crypto.randomUUID(),
    addedAt: Date.now(),
  };
  writeRaw([newEntry, ...entries]);
  return { ok: true, entry: newEntry };
}

export function removeRetryQueueEntry(id: string) {
  writeRaw(readRaw().filter((item) => item.id !== id));
}

export function isInRetryQueue(patternId: PatternId, itemKey: string): boolean {
  return readRaw().some((item) => item.patternId === patternId && item.itemKey === itemKey);
}
