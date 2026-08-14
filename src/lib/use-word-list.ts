"use client";

import { useCallback, useEffect, useState } from "react";
import type { LanguageId } from "@/lib/languages";
import {
  addWordListEntry,
  loadWordList,
  removeWordListEntry,
  updateWordListNote,
  type WordListEntry,
} from "@/lib/word-list";

export function useWordList() {
  const [entries, setEntries] = useState<WordListEntry[]>([]);

  const refresh = useCallback(() => {
    setEntries(loadWordList());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addEntry = useCallback(
    (params: {
      term: string;
      note?: string;
      language: LanguageId;
      source: string;
    }) => {
      const result = addWordListEntry({
        term: params.term,
        note: params.note ?? "",
        language: params.language,
        source: params.source,
      });
      if (result.ok) refresh();
      return result;
    },
    [refresh]
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

  return { entries, addEntry, removeEntry, updateNote, refresh };
}
