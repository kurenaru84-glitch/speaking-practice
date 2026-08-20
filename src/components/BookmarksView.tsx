"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ProtectedImage } from "@/components/ProtectedImage";
import { IconStar, IconX } from "@/components/icons";
import {
  loadBookmarks,
  removeBookmark,
  type BookmarkEntry,
} from "@/lib/bookmarks";
import { resolveBookmarkThumb } from "@/lib/bookmark-thumb";
import { PATTERN_LABELS } from "@/lib/pattern-labels";
import type { ImageCatalog } from "@/lib/image-catalog-types";
import { SITE } from "@/lib/site";

const NAVIGATE_KEY = "pikuspi-bookmark-navigate";

export type BookmarkNavigatePayload = {
  patternId: BookmarkEntry["patternId"];
  itemKey: string;
};

export function consumeBookmarkNavigate(): BookmarkNavigatePayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(NAVIGATE_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(NAVIGATE_KEY);
    return JSON.parse(raw) as BookmarkNavigatePayload;
  } catch {
    return null;
  }
}

export function stashBookmarkNavigate(payload: BookmarkNavigatePayload) {
  sessionStorage.setItem(NAVIGATE_KEY, JSON.stringify(payload));
}

export function BookmarksView() {
  const [entries, setEntries] = useState<BookmarkEntry[]>([]);
  const [imageCatalog, setImageCatalog] = useState<ImageCatalog | null>(null);

  const refresh = useCallback(() => {
    setEntries(loadBookmarks());
  }, []);

  useEffect(() => {
    refresh();
    fetch("/api/images/catalog")
      .then((res) => res.json())
      .then((data: ImageCatalog) => setImageCatalog(data))
      .catch(() => setImageCatalog(null));
  }, [refresh]);

  const rows = useMemo(() => {
    if (!imageCatalog) {
      return entries.map((entry) => ({
        entry,
        thumb: { label: entry.itemTitleJa, kind: "text" as const, thumbnail: undefined as string | undefined },
      }));
    }
    return entries.map((entry) => ({
      entry,
      thumb: resolveBookmarkThumb(entry, imageCatalog),
    }));
  }, [entries, imageCatalog]);

  function handleRemove(id: string) {
    removeBookmark(id);
    refresh();
  }

  return (
    <main className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-4 md:py-8">
      <header className="flex flex-col gap-2">
        <Link href="/" className="hidden text-sm font-medium text-amber-800 hover:underline md:inline">
          ← 練習に戻る
        </Link>
        <div className="flex items-center gap-2">
          <IconStar className="h-6 w-6 text-amber-600" />
          <h1 className="text-2xl font-semibold text-stone-900">お気に入り</h1>
        </div>
        <p className="text-sm leading-6 text-stone-600">
          保存したセッション一覧です。タップで練習画面に移動します。
        </p>
      </header>

      {rows.length === 0 ? (
        <div className="card-muted px-5 py-8 text-center text-sm leading-6 text-stone-600">
          お気に入りはまだありません。
          <br />
          練習画面の ★ ボタンから追加できます。
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map(({ entry, thumb }) => (
            <li key={entry.id}>
              <div className="card flex items-stretch overflow-hidden">
                <Link
                  href="/"
                  onClick={() =>
                    stashBookmarkNavigate({
                      patternId: entry.patternId,
                      itemKey: entry.itemKey,
                    })
                  }
                  className="flex min-w-0 flex-1 items-center gap-3 p-3 pr-2 transition-colors hover:bg-stone-50"
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-stone-100 ring-1 ring-stone-200 md:h-16 md:w-16">
                    {thumb.thumbnail ? (
                      <ProtectedImage
                        src={thumb.thumbnail}
                        alt={thumb.label}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col justify-center gap-1 bg-gradient-to-br from-amber-50 to-white p-2">
                        <span className="badge-neutral inline-flex w-fit text-[10px]">
                          {PATTERN_LABELS[entry.patternId]}
                        </span>
                        <span className="line-clamp-2 text-[11px] font-medium leading-4 text-stone-700">
                          {thumb.label}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-semibold text-stone-900">{thumb.label}</p>
                    <p className="mt-1 text-sm text-stone-500">{PATTERN_LABELS[entry.patternId]}</p>
                    {entry.itemTitleJa !== thumb.label && (
                      <p className="mt-1 truncate text-xs text-stone-400">{entry.itemTitleJa}</p>
                    )}
                  </div>
                </Link>
                <button
                  type="button"
                  className="flex shrink-0 items-center px-3 text-stone-400 transition-colors hover:bg-stone-50 hover:text-red-600"
                  onClick={() => handleRemove(entry.id)}
                  aria-label={`${entry.itemTitleJa} のお気に入りを解除`}
                >
                  <IconX className="h-5 w-5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <footer className="text-center text-xs text-stone-500">
        <p>{SITE.operator}</p>
      </footer>
    </main>
  );
}
