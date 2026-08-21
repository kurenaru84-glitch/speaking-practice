"use client";

import { useEffect, useMemo, useState } from "react";
import { ProtectedImage } from "@/components/ProtectedImage";
import {
  getPageForIndex,
  getSessionPageCount,
  getSessionPageLabel,
  SESSION_PAGE_SIZE,
} from "@/lib/session-pages";
import type { SessionThumb } from "@/lib/session-thumbs";

export type { SessionThumb };

type Props = {
  items: SessionThumb[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  disabled?: boolean;
  pageSize?: number;
  itemCountLabel?: string;
};

export function SessionThumbnailGrid({
  items,
  selectedIndex,
  onSelect,
  disabled,
  pageSize = SESSION_PAGE_SIZE,
  itemCountLabel,
}: Props) {
  const pageCount = getSessionPageCount(items.length, pageSize);
  const selectedPage = getPageForIndex(selectedIndex, pageSize);
  const [activePage, setActivePage] = useState(selectedPage);

  useEffect(() => {
    setActivePage(selectedPage);
  }, [selectedPage]);

  const visibleItems = useMemo(() => {
    const start = activePage * pageSize;
    return items.slice(start, start + pageSize);
  }, [activePage, items, pageSize]);

  if (items.length <= 1) return null;

  return (
    <div className="border-t border-stone-200 px-3 py-3">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <p className="label-caps">セッションを選ぶ ({items.length})</p>
        {itemCountLabel && (
          <p className="text-xs font-medium text-stone-500">{itemCountLabel}</p>
        )}
      </div>

      {pageCount > 1 && (
        <div className="-mx-1 mb-3 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex w-max min-w-full gap-1.5">
            {Array.from({ length: pageCount }, (_, pageIndex) => {
              const selected = activePage === pageIndex;
              return (
                <button
                  key={pageIndex}
                  type="button"
                  disabled={disabled}
                  onClick={() => setActivePage(pageIndex)}
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    selected
                      ? "bg-stone-900 text-white"
                      : "border border-stone-200 bg-white text-stone-600 hover:border-stone-300"
                  }`}
                >
                  {getSessionPageLabel(pageIndex, items.length, pageSize)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid max-h-72 grid-cols-2 gap-2 overflow-y-auto pr-1">
        {visibleItems.map((item) => {
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
