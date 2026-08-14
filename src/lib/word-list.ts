import type { LanguageId } from "@/lib/languages";

export type WordListEntry = {
  id: string;
  term: string;
  note: string;
  language: LanguageId;
  source: string;
  addedAt: number;
};

const STORAGE_KEY = "speaking-practice-word-list";

function readRaw(): WordListEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as WordListEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRaw(entries: WordListEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function loadWordList(): WordListEntry[] {
  return readRaw().sort((a, b) => b.addedAt - a.addedAt);
}

export function addWordListEntry(
  entry: Omit<WordListEntry, "id" | "addedAt">
): { ok: true; entry: WordListEntry } | { ok: false; reason: "duplicate" } {
  const term = entry.term.trim();
  if (!term) return { ok: false, reason: "duplicate" };

  const entries = readRaw();
  const exists = entries.some(
    (item) =>
      item.language === entry.language &&
      item.term.trim().toLowerCase() === term.toLowerCase()
  );
  if (exists) return { ok: false, reason: "duplicate" };

  const newEntry: WordListEntry = {
    ...entry,
    term,
    note: entry.note.trim(),
    id: crypto.randomUUID(),
    addedAt: Date.now(),
  };
  writeRaw([newEntry, ...entries]);
  return { ok: true, entry: newEntry };
}

export function removeWordListEntry(id: string) {
  writeRaw(readRaw().filter((item) => item.id !== id));
}

export function updateWordListNote(id: string, note: string) {
  writeRaw(
    readRaw().map((item) => (item.id === id ? { ...item, note: note.trim() } : item))
  );
}
