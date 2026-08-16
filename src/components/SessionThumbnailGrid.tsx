"use client";

import type { SessionThumb } from "@/lib/session-thumbs";

export type { SessionThumb };

type Props = {
  items: SessionThumb[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  disabled?: boolean;
};

export function SessionThumbnailGrid({ items, selectedIndex, onSelect, disabled }: Props) {
  if (items.length <= 1) return null;

  return (
    <div className="border-t border-stone-200 px-3 py-3">
      <p className="label-caps mb-2">セッションを選ぶ ({items.length})</p>
      <div className="grid max-h-72 grid-cols-2 gap-2 overflow-y-auto pr-1">
        {items.map((item) => {
          const selected = item.index === selectedIndex;
          return (
            <button
              key={`${item.index}-${item.thumbnail}`}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(item.index)}
              className={`overflow-hidden rounded-xl border text-left transition-colors ${
                selected
                  ? "border-amber-600 ring-2 ring-amber-200"
                  : "border-stone-200 hover:border-stone-300"
              }`}
            >
              <div className="relative aspect-[4/3] bg-stone-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.thumbnail}
                  alt={item.label}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                {selected && (
                  <span className="absolute right-1.5 top-1.5 badge bg-amber-700 text-white">
                    選択中
                  </span>
                )}
              </div>
              <p className="truncate px-2 py-1.5 text-xs font-medium text-stone-700">{item.label}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
