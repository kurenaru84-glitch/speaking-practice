"use client";

import Link from "next/link";
import type { BookmarkEntry } from "@/lib/bookmarks";
import { IconStar } from "@/components/icons";

type Props = {
  entries: BookmarkEntry[];
  disabled?: boolean;
};

export function BookmarkMenu({ entries, disabled }: Props) {
  return (
    <Link
      href="/bookmarks"
      className={`btn-secondary inline-flex items-center gap-1.5 ${disabled ? "pointer-events-none opacity-50" : ""}`}
      aria-label="お気に入り一覧"
    >
      <IconStar className="h-4 w-4 text-sky-500" />
      お気に入り
      {entries.length > 0 && (
        <span className="badge-accent tabular-nums">{entries.length}</span>
      )}
    </Link>
  );
}
