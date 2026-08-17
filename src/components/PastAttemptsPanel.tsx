"use client";

import { useState } from "react";
import type { TextAttemptEntry } from "@/lib/text-attempt-history";

type Props = {
  attempts: TextAttemptEntry[];
  disabled?: boolean;
};

function formatWhen(timestamp: number) {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

export function PastAttemptsPanel({ attempts, disabled }: Props) {
  const [open, setOpen] = useState(false);

  if (attempts.length === 0) return null;

  return (
    <div className="rounded-xl border border-stone-200 bg-stone-50">
      <button
        type="button"
        disabled={disabled}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="text-sm font-medium text-stone-800">
          過去のテキストを見る
          <span className="ml-2 badge-neutral tabular-nums">{attempts.length}</span>
        </span>
        <span className="text-xs text-stone-500">{open ? "閉じる" : "開く"}</span>
      </button>
      {open && (
        <div className="space-y-2 border-t border-stone-200 px-4 py-3">
          {attempts.map((attempt, index) => (
            <div
              key={`${attempt.createdAt}-${index}`}
              className="rounded-xl border border-stone-200 bg-white px-3 py-3"
            >
              <p className="text-xs text-stone-500">{formatWhen(attempt.createdAt)}</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-stone-800">
                {attempt.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
