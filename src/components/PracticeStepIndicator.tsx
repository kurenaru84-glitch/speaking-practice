"use client";

export type PracticeStep = 1 | 2 | 3;

const STEPS = [
  { id: 1 as const, label: "お題を確認" },
  { id: 2 as const, label: "話す / 書く" },
  { id: 3 as const, label: "添削を見る" },
];

type Props = {
  step: PracticeStep;
  loading?: boolean;
};

export function PracticeStepIndicator({ step, loading }: Props) {
  return (
    <nav aria-label="練習の流れ" className="card px-4 py-3">
      <ol className="flex items-center gap-2 sm:gap-3">
        {STEPS.map((item, index) => {
          const done = item.id < step;
          const current = item.id === step;
          const isLast = index === STEPS.length - 1;

          return (
            <li key={item.id} className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${
                    done
                      ? "bg-emerald-600 text-white"
                      : current
                        ? "bg-amber-700 text-white"
                        : "bg-stone-100 text-stone-500"
                  }`}
                  aria-hidden
                >
                  {done ? "✓" : item.id}
                </span>
                <div className="min-w-0">
                  <p
                    className={`truncate text-sm font-medium ${
                      current ? "text-stone-900" : done ? "text-stone-700" : "text-stone-500"
                    }`}
                  >
                    {item.label}
                    {current && loading ? "…" : ""}
                  </p>
                </div>
              </div>
              {!isLast && (
                <div
                  className={`hidden h-px flex-1 sm:block ${done ? "bg-emerald-300" : "bg-stone-200"}`}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function resolvePracticeStep({
  feedback,
  recording,
  transcribing,
  loading,
  hasText,
}: {
  feedback: unknown;
  recording: boolean;
  transcribing: boolean;
  loading: boolean;
  hasText: boolean;
}): PracticeStep {
  if (feedback) return 3;
  if (recording || transcribing || loading || hasText) return 2;
  return 1;
}
