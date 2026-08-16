"use client";

import { PATTERN_LABELS } from "@/lib/pattern-labels";
import type { RetryQueueEntry } from "@/lib/retry-queue";

type Props = {
  entries: RetryQueueEntry[];
  onSelect: (entry: RetryQueueEntry) => void;
  onRemove: (id: string) => void;
};

export function RetryQueuePanel({ entries, onSelect, onRemove }: Props) {
  if (entries.length === 0) return null;

  return (
    <div className="card-muted p-4">
      <h3 className="text-sm font-semibold text-stone-900">再挑戦キュー ({entries.length})</h3>
      <ul className="mt-3 space-y-2">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="flex items-center justify-between gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2"
          >
            <button
              type="button"
              className="min-w-0 flex-1 text-left"
              onClick={() => onSelect(entry)}
            >
              <p className="truncate text-sm font-medium text-stone-900">{entry.itemTitleJa}</p>
              <p className="text-xs text-stone-500">{PATTERN_LABELS[entry.patternId]}</p>
            </button>
            <button
              type="button"
              className="shrink-0 text-xs font-medium text-stone-500 hover:text-red-700"
              onClick={() => onRemove(entry.id)}
              aria-label="キューから削除"
            >
              削除
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
