"use client";

import type { BookmarkEntry } from "@/lib/bookmarks";
import { PATTERN_LABELS } from "@/lib/pattern-labels";
import { IconStar, IconX } from "@/components/icons";

type Props = {
  entries: BookmarkEntry[];
  onSelect: (entry: BookmarkEntry) => void;
  onRemove: (id: string) => void;
};

export function BookmarkPanel({ entries, onSelect, onRemove }: Props) {
  if (entries.length === 0) return null;

  return (
    <div className="card-muted p-4">
      <h3 className="text-sm font-semibold text-stone-900">ブックマーク ({entries.length})</h3>
      <ul className="mt-3 flex flex-wrap gap-2">
        {entries.map((entry) => (
          <li key={entry.id}>
            <div className="flex items-center gap-1 rounded-xl border border-stone-200 bg-white pl-3 pr-1 py-1.5">
              <button
                type="button"
                className="min-w-0 text-left"
                onClick={() => onSelect(entry)}
              >
                <span className="mr-1 inline-flex align-middle text-amber-600" aria-hidden>
                  <IconStar className="h-3.5 w-3.5" />
                </span>
                <span className="text-sm font-medium text-stone-900">{entry.itemTitleJa}</span>
                <span className="ml-1.5 text-xs text-stone-500">
                  {PATTERN_LABELS[entry.patternId]}
                </span>
              </button>
              <button
                type="button"
                className="rounded-lg p-1 text-stone-400 transition-colors hover:bg-stone-100 hover:text-red-600"
                onClick={() => onRemove(entry.id)}
                aria-label={`${entry.itemTitleJa} のブックマークを解除`}
              >
                <IconX className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
