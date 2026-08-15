"use client";

import type { ChecklistItem } from "@/lib/types";

type Props = {
  items: ChecklistItem[];
};

export function FeedbackChecklist({ items }: Props) {
  if (items.length === 0) return null;

  const passed = items.filter((item) => item.passed).length;

  return (
    <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-stone-900">チェックリスト</h3>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            passed === items.length
              ? "bg-emerald-100 text-emerald-800"
              : "bg-amber-100 text-amber-900"
          }`}
        >
          {passed}/{items.length}
        </span>
      </div>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id} className="flex gap-2 text-sm">
            <span
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                item.passed ? "bg-emerald-600 text-white" : "bg-stone-300 text-stone-700"
              }`}
              aria-hidden
            >
              {item.passed ? "✓" : "·"}
            </span>
            <div>
              <p className={item.passed ? "text-stone-800" : "font-medium text-stone-900"}>
                {item.labelJa}
              </p>
              {item.note && <p className="mt-0.5 text-xs leading-5 text-stone-500">{item.note}</p>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
