"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LanguageId } from "@/lib/languages";
import { getSettings } from "@/lib/settings";
import { fetchNativeTranslation } from "@/lib/fetch-translation";
import {
  addWordListEntry,
  loadWordList,
  removeWordListEntry,
  setWordListLearned,
  updateWordListNote,
  type WordListEntry,
} from "@/lib/word-list";

export function useWordList() {
  const [entries, setEntries] = useState<WordListEntry[]>([]);
  const translatingRef = useRef<Set<string>>(new Set());

  const refresh = useCallback(() => {
    setEntries(loadWordList());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const translateNote = useCallback(
    async (id: string, term: string, language: LanguageId) => {
      if (translatingRef.current.has(id)) return;
      translatingRef.current.add(id);
      try {
        const { nativeLanguage } = getSettings();
        const translationJa = await fetchNativeTranslation(term, language, nativeLanguage);
        updateWordListNote(id, translationJa);
        refresh();
      } finally {
        translatingRef.current.delete(id);
      }
    },
    [refresh]
  );

  const addEntry = useCallback(
    (params: {
      term: string;
      note?: string;
      language: LanguageId;
      source: string;
      autoTranslate?: boolean;
    }) => {
      const result = addWordListEntry({
        term: params.term,
        note: params.note ?? "",
        language: params.language,
        source: params.source,
        learned: false,
      });
      if (result.ok) {
        refresh();
        const shouldTranslate =
          params.autoTranslate !== false && !params.note?.trim();
        if (shouldTranslate) {
          void translateNote(result.entry.id, params.term, params.language);
        }
      }
      return result;
    },
    [refresh, translateNote]
  );

  const removeEntry = useCallback(
    (id: string) => {
      removeWordListEntry(id);
      refresh();
    },
    [refresh]
  );

  const updateNote = useCallback(
    (id: string, note: string) => {
      updateWordListNote(id, note);
      refresh();
    },
    [refresh]
  );

  const setLearned = useCallback(
    (id: string, learned: boolean) => {
      setWordListLearned(id, learned);
      refresh();
    },
    [refresh]
  );

  return { entries, addEntry, removeEntry, updateNote, setLearned, translateNote, refresh };
}
