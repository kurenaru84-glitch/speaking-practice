"use client";

import type { FeedbackGrade as Grade } from "@/lib/types";

type Props = {
  grade: Grade;
  gradeNote?: string;
};

const GRADE_STYLES: Record<Grade, string> = {
  A: "bg-emerald-600 text-white ring-emerald-200",
  B: "bg-amber-600 text-white ring-amber-200",
  C: "bg-amber-500 text-white ring-amber-200",
  D: "bg-amber-400 text-amber-950 ring-amber-200",
  E: "bg-stone-400 text-white ring-stone-200",
};

export function FeedbackGradeBadge({ grade, gradeNote }: Props) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-stone-50 p-4 ring-1 ring-amber-100">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold ring-2 ${GRADE_STYLES[grade]}`}
          aria-label={`今回のまとめ ${grade}`}
        >
          {grade}
        </div>
        <div className="min-w-0 pt-1">
          <p className="text-sm font-semibold text-stone-900">今回のまとめ</p>
          <p className="mt-0.5 text-xs text-stone-500">
            上のフィードバックを読んだあと、全体の印象です
          </p>
          {gradeNote ? (
            <p className="mt-2 text-sm leading-7 text-stone-700">{gradeNote}</p>
          ) : (
            <p className="mt-2 text-sm leading-7 text-stone-600">
              よくがんばりました。次もこの調子で続けてみましょう。
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
