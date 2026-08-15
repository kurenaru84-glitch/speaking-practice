import type { LanguageId } from "@/lib/languages";
import type { PatternId } from "@/lib/patterns";
import type { FeedbackResult } from "@/lib/types";

export type PracticeHistoryEntry = {
  id: string;
  patternId: PatternId;
  itemKey: string;
  itemTitleJa: string;
  userText: string;
  feedback: FeedbackResult;
  learningLanguage: LanguageId;
  createdAt: number;
};

const STORAGE_KEY = "speaking-practice-history";
const MAX_ENTRIES = 200;

function readRaw(): PracticeHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PracticeHistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRaw(entries: PracticeHistoryEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
}

export function loadPracticeHistory(): PracticeHistoryEntry[] {
  return readRaw().sort((a, b) => b.createdAt - a.createdAt);
}

export function savePracticeHistory(entry: Omit<PracticeHistoryEntry, "id" | "createdAt">) {
  const newEntry: PracticeHistoryEntry = {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  writeRaw([newEntry, ...readRaw()]);
  return newEntry;
}

export function getLatestPracticeHistory(
  itemKey: string,
  learningLanguage: LanguageId
): PracticeHistoryEntry | null {
  return (
    readRaw().find(
      (entry) => entry.itemKey === itemKey && entry.learningLanguage === learningLanguage
    ) ?? null
  );
}

export function getPracticeHistoryForItem(
  itemKey: string,
  learningLanguage: LanguageId,
  limit = 5
): PracticeHistoryEntry[] {
  return readRaw()
    .filter((entry) => entry.itemKey === itemKey && entry.learningLanguage === learningLanguage)
    .slice(0, limit);
}

export function countChecklistPassed(feedback: FeedbackResult): { passed: number; total: number } {
  const items = feedback.checklist ?? [];
  if (items.length === 0) return { passed: 0, total: 0 };
  return {
    passed: items.filter((item) => item.passed).length,
    total: items.length,
  };
}
