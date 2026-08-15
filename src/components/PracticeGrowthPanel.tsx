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
    <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
      <h3 className="text-sm font-semibold text-sky-900">前回との比較</h3>
      {feedback.growthNote && (
        <p className="mt-2 text-sm leading-6 text-sky-950">{feedback.growthNote}</p>
      )}
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl bg-white/80 p-3">
          <p className="text-xs font-medium text-stone-500">前回のあなたの回答</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-stone-700">
            {previous.userText}
          </p>
          {previous.feedback.natural[0]?.text && (
            <div className="mt-3 border-t border-stone-200 pt-3">
              <p className="text-xs font-medium text-stone-500">前回の模範例（抜粋）</p>
              <p className="mt-1 line-clamp-4 whitespace-pre-wrap text-sm leading-6 text-stone-600">
                {previous.feedback.natural[0].text}
              </p>
            </div>
          )}
        </div>
        <div className="rounded-xl bg-white/80 p-3">
          <p className="text-xs font-medium text-stone-500">今回のあなたの回答</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-stone-800">{currentText}</p>
          {feedback.natural[0]?.text && (
            <div className="mt-3 border-t border-stone-200 pt-3">
              <p className="text-xs font-medium text-stone-500">今回の模範例（抜粋）</p>
              <p className="mt-1 line-clamp-4 whitespace-pre-wrap text-sm leading-6 text-stone-600">
                {feedback.natural[0].text}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
