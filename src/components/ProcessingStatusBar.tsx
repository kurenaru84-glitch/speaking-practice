"use client";

import { useEffect, useState } from "react";

export type ProcessingPhase = "transcribe" | "feedback";

const STEPS: Record<ProcessingPhase, string[]> = {
  transcribe: [
    "音声データを送信中...",
    "音声を解析しています...",
    "文字起こしを作成中...",
  ],
  feedback: [
    "あなたの回答を読み取り中...",
    "添削コメントを作成中...",
    "模範例と語彙を準備中...",
  ],
};

const SUBTEXT: Record<ProcessingPhase, string> = {
  transcribe: "Gemini が録音内容をテキストに変換しています",
  feedback: "Gemini がフィードバックを作成しています",
};

function useSimulatedProgress(active: boolean) {
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (!active) {
      setProgress(0);
      setStepIndex(0);
      return;
    }

    setProgress(8);
    const progressTimer = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 92) return current;
        if (current < 35) return current + 4;
        if (current < 65) return current + 2.5;
        if (current < 85) return current + 1;
        return current + 0.4;
      });
    }, 350);

    const stepTimer = window.setInterval(() => {
      setStepIndex((current) => current + 1);
    }, 2400);

    return () => {
      window.clearInterval(progressTimer);
      window.clearInterval(stepTimer);
    };
  }, [active]);

  return { progress: active ? Math.round(progress) : 0, stepIndex };
}

type Props = {
  active: boolean;
  phase: ProcessingPhase;
};

export function ProcessingStatusBar({ active, phase }: Props) {
  const { progress, stepIndex } = useSimulatedProgress(active);

  if (!active) return null;

  const steps = STEPS[phase];
  const message = steps[stepIndex % steps.length];

  return (
    <div
      className="notice-accent px-4 py-4"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-amber-950">{message}</p>
          <p className="mt-1 text-xs leading-5 text-stone-500">{SUBTEXT[phase]}</p>
        </div>
        <span className="badge-accent shrink-0 tabular-nums">
          {progress}%
        </span>
      </div>
      <div className="relative h-2.5 overflow-hidden rounded-full bg-amber-100">
        <div
          className="relative h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-700 transition-[width] duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
          <div className="processing-bar-shimmer h-full w-1/3 bg-white/35" />
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {steps.map((step, index) => {
          const currentStep = stepIndex % steps.length;
          const done = stepIndex >= steps.length ? false : index < currentStep;
          const current = index === currentStep;
          return (
            <span
              key={step}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-medium ${
                current
                  ? "bg-amber-700 text-white"
                  : done
                    ? "badge-success"
                    : "bg-stone-100 text-stone-500"
              }`}
            >
              {index + 1}. {step.replace(/\.\.\.$/, "")}
            </span>
          );
        })}
      </div>
    </div>
  );
}
