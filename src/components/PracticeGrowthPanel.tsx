"use client";

import type { PracticeHistoryEntry } from "@/lib/practice-history";
import type { FeedbackResult } from "@/lib/types";

type Props = {
  previous: PracticeHistoryEntry;
  currentText: string;
  feedback: FeedbackResult;
};

export function PracticeGrowthPanel({ previous, currentText, feedback }: Props) {
  return (
    <div className="card-muted p-4">
      <h3 className="text-sm font-semibold text-stone-900">前回との比較</h3>
      {feedback.growthNote && (
        <p className="mt-2 text-sm leading-7 text-stone-700">{feedback.growthNote}</p>
      )}
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-stone-200 bg-white p-3">
          <p className="text-xs font-medium text-stone-500">前回のあなたの回答</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-stone-700">
            {previous.userText}
          </p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-3">
          <p className="text-xs font-medium text-stone-500">今回のあなたの回答</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-stone-800">{currentText}</p>
        </div>
      </div>
    </div>
  );
}
