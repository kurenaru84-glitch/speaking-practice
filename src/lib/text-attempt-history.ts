import type { LanguageId } from "@/lib/languages";

export type TextAttemptEntry = {
  text: string;
  createdAt: number;
};

const STORAGE_KEY = "pikuspi-text-attempts";
const MAX_PER_ITEM = 3;

type Store = Record<string, TextAttemptEntry[]>;

function storeKey(itemKey: string, learningLanguage: LanguageId) {
  return `${itemKey}::${learningLanguage}`;
}

function readStore(): Store {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Store;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStore(store: Store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function appendTextAttempt(
  itemKey: string,
  learningLanguage: LanguageId,
  text: string
) {
  const trimmed = text.trim();
  if (!trimmed) return;

  const key = storeKey(itemKey, learningLanguage);
  const store = readStore();
  const existing = store[key] ?? [];
  const latest = existing[0];
  if (latest?.text === trimmed) return;

  store[key] = [{ text: trimmed, createdAt: Date.now() }, ...existing].slice(0, MAX_PER_ITEM);
  writeStore(store);
}

export function getTextAttempts(
  itemKey: string,
  learningLanguage: LanguageId
): TextAttemptEntry[] {
  return readStore()[storeKey(itemKey, learningLanguage)] ?? [];
}
