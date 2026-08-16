"use client";

import { ProtectedImage } from "@/components/ProtectedImage";
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
              key={`${item.index}-${item.label}`}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(item.index)}
              className={`overflow-hidden rounded-xl border text-left transition-colors ${
                selected
                  ? "border-amber-600 ring-2 ring-amber-200"
                  : "border-stone-200 hover:border-stone-300"
              }`}
            >
              {item.kind === "text" ? (
                <div className="relative flex aspect-[4/3] flex-col justify-between bg-gradient-to-br from-stone-50 to-white p-3">
                  <div>
                    {item.badge && (
                      <span className="badge-neutral mb-2 inline-flex">{item.badge}</span>
                    )}
                    <p className="line-clamp-2 text-sm font-semibold leading-5 text-stone-900">
                      {item.label}
                    </p>
                  </div>
                  {item.subtitle && (
                    <p className="mt-2 line-clamp-3 text-xs leading-5 text-stone-500">{item.subtitle}</p>
                  )}
                  {selected && (
                    <span className="absolute right-1.5 top-1.5 badge bg-amber-700 text-white">
                      選択中
                    </span>
                  )}
                </div>
              ) : (
                <div className="relative aspect-[4/3] bg-stone-100">
                  <ProtectedImage
                    src={item.thumbnail ?? ""}
                    alt={item.label}
                    className="pointer-events-none h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="absolute left-1.5 top-1.5 badge bg-black/60 text-white">
                    {item.label}
                  </span>
                  {selected && (
                    <span className="absolute right-1.5 top-1.5 badge bg-amber-700 text-white">
                      選択中
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
