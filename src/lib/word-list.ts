import type { LanguageId } from "@/lib/languages";

export type WordListEntry = {
  id: string;
  term: string;
  note: string;
  language: LanguageId;
  source: string;
  learned: boolean;
  addedAt: number;
};

const STORAGE_KEY = "speaking-practice-word-list";

function normalizeEntry(raw: Partial<WordListEntry> & { id: string }): WordListEntry {
  return {
    id: raw.id,
    term: raw.term ?? "",
    note: raw.note ?? "",
    language: (raw.language ?? "en-US") as LanguageId,
    source: raw.source ?? "",
    learned: Boolean(raw.learned),
    addedAt: raw.addedAt ?? Date.now(),
  };
}

function readRaw(): WordListEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Array<Partial<WordListEntry> & { id: string }>;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeEntry);
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
  entry: Omit<WordListEntry, "id" | "addedAt" | "learned"> & { learned?: boolean }
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
    learned: entry.learned ?? false,
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

export function setWordListLearned(id: string, learned: boolean) {
  writeRaw(
    readRaw().map((item) => (item.id === id ? { ...item, learned } : item))
  );
}
