"use client";

import { useEffect, useRef, useState } from "react";
import type { BookmarkEntry } from "@/lib/bookmarks";
import { PATTERN_LABELS } from "@/lib/pattern-labels";
import { IconStar, IconX } from "@/components/icons";

type Props = {
  entries: BookmarkEntry[];
  onSelect: (entry: BookmarkEntry) => void;
  onRemove: (id: string) => void;
  disabled?: boolean;
};

export function BookmarkMenu({ entries, onSelect, onRemove, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="btn-secondary inline-flex items-center gap-1.5"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((prev) => !prev)}
      >
        <IconStar className="h-4 w-4 text-amber-600" />
        お気に入り
        {entries.length > 0 && (
          <span className="badge-accent tabular-nums">{entries.length}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-stone-200 bg-white p-3 shadow-lg">
          <p className="text-sm font-semibold text-stone-900">お気に入りセッション</p>
          {entries.length === 0 ? (
            <p className="mt-3 text-sm leading-6 text-stone-500">
              ★ ボタンで保存したセッションがここに表示されます。
            </p>
          ) : (
            <ul className="mt-3 max-h-72 space-y-2 overflow-y-auto">
              {entries.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center gap-2 rounded-lg border border-stone-200 bg-stone-50 px-2 py-2"
                >
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={() => {
                      onSelect(entry);
                      setOpen(false);
                    }}
                  >
                    <p className="truncate text-sm font-medium text-stone-900">{entry.itemTitleJa}</p>
                    <p className="text-xs text-stone-500">{PATTERN_LABELS[entry.patternId]}</p>
                  </button>
                  <button
                    type="button"
                    className="shrink-0 rounded-lg p-1 text-stone-400 hover:bg-white hover:text-red-600"
                    onClick={() => onRemove(entry.id)}
                    aria-label={`${entry.itemTitleJa} のブックマークを解除`}
                  >
                    <IconX className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
