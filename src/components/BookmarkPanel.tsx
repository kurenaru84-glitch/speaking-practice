"use client";

import type { BookmarkEntry } from "@/lib/bookmarks";
import { PATTERN_LABELS } from "@/lib/pattern-labels";

type Props = {
  entries: BookmarkEntry[];
  onSelect: (entry: BookmarkEntry) => void;
  onRemove: (id: string) => void;
};

export function BookmarkPanel({ entries, onSelect, onRemove }: Props) {
  if (entries.length === 0) return null;

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
      <h3 className="text-sm font-semibold text-amber-950">ブックマーク ({entries.length})</h3>
      <ul className="mt-3 flex flex-wrap gap-2">
        {entries.map((entry) => (
          <li key={entry.id}>
            <div className="flex items-center gap-1 rounded-full bg-white pl-3 pr-1 py-1.5 ring-1 ring-amber-200/80">
              <button
                type="button"
                className="min-w-0 text-left"
                onClick={() => onSelect(entry)}
              >
                <span className="mr-1 text-amber-500" aria-hidden>
                  ★
                </span>
                <span className="text-sm font-medium text-stone-900">{entry.itemTitleJa}</span>
                <span className="ml-1.5 text-xs text-stone-500">
                  {PATTERN_LABELS[entry.patternId]}
                </span>
              </button>
              <button
                type="button"
                className="rounded-full px-2 py-0.5 text-xs text-stone-400 hover:bg-stone-100 hover:text-red-600"
                onClick={() => onRemove(entry.id)}
                aria-label={`${entry.itemTitleJa} のブックマークを解除`}
              >
                ×
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
