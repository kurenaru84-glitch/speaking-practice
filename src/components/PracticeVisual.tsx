"use client";

import { ProtectedImage } from "@/components/ProtectedImage";
import { PracticeImage } from "@/components/PracticeImage";
import { ContentLoadingSkeleton } from "@/components/ContentLoadingSkeleton";
import type {
  CompareSet,
  EmailScenario,
  InterviewQuestion,
  RoleplayScenario,
} from "@/lib/types";

type Props = {
  contentLoading: boolean;
  isInterview: boolean;
  isEmail: boolean;
  isCompare: boolean;
  isMultiVisual: boolean;
  isStory: boolean;
  hasVisual: boolean;
  currentInterview: InterviewQuestion | null;
  currentEmail: EmailScenario | null;
  currentCompare: CompareSet | null;
  currentScenario: RoleplayScenario | null;
  currentImages: string[];
  recording: boolean;
  transcribing: boolean;
  secondsLeft: number;
  compact?: boolean;
  className?: string;
};

export function PracticeVisual({
  contentLoading,
  isInterview,
  isEmail,
  isCompare,
  isMultiVisual,
  hasVisual,
  currentInterview,
  currentEmail,
  currentCompare,
  currentScenario,
  currentImages,
  recording,
  transcribing,
  secondsLeft,
  compact,
  className = "",
}: Props) {
  const shellClass = compact
    ? "relative overflow-hidden rounded-xl bg-stone-100 aspect-[4/3]"
    : `relative bg-stone-100 ${isMultiVisual || isInterview || isEmail ? "p-3" : "aspect-[4/3]"}`;

  return (
    <div
      className={`${shellClass} ${className}`}
      onContextMenu={(event) => event.preventDefault()}
    >
      {contentLoading ? (
        <ContentLoadingSkeleton
          className={
            compact
              ? "aspect-[4/3] rounded-xl"
              : isMultiVisual || isInterview || isEmail
                ? "min-h-[280px] rounded-xl"
                : "aspect-[4/3]"
          }
        />
      ) : isInterview ? (
        currentInterview ? (
          <div
            className={`flex flex-col justify-center rounded-xl border border-stone-200 bg-white ${
              compact ? "h-full px-4 py-4" : "min-h-[280px] px-6 py-8"
            }`}
          >
            <p className="badge-accent w-fit">{currentInterview.categoryJa}</p>
            <h2 className={`mt-3 font-semibold text-stone-900 ${compact ? "text-base" : "text-xl"}`}>
              {currentInterview.titleJa}
            </h2>
            {!compact && (
              <>
                <p className="mt-4 text-base leading-7 text-stone-800">{currentInterview.promptJa}</p>
                <p className="mt-4 border-t border-stone-100 pt-4 text-sm leading-6 text-stone-500">
                  {currentInterview.promptEn}
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center text-sm text-stone-500">
            お題がありません
          </div>
        )
      ) : isEmail ? (
        currentEmail ? (
          <div
            className={`flex flex-col rounded-xl border border-stone-200 bg-white ${
              compact ? "h-full px-4 py-4" : "min-h-[280px] px-6 py-8"
            }`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <p className="badge-accent">{currentEmail.categoryJa}</p>
              <p className="badge-neutral">{currentEmail.type === "reply" ? "返信" : "新規作成"}</p>
            </div>
            <h2 className={`mt-3 font-semibold text-stone-900 ${compact ? "text-base" : "text-xl"}`}>
              {currentEmail.titleJa}
            </h2>
            {!compact && (
              <>
                <p className="mt-4 text-base leading-7 text-stone-800">{currentEmail.promptJa}</p>
                <p className="mt-3 text-sm leading-6 text-stone-500">{currentEmail.promptEn}</p>
              </>
            )}
          </div>
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center text-sm text-stone-500">
            お題がありません
          </div>
        )
      ) : hasVisual ? (
        isMultiVisual ? (
          isCompare ? (
            <div className={`flex flex-col gap-2 ${compact ? "h-full p-2" : ""}`}>
              {currentImages.slice(0, 2).map((src, i) => (
                <div key={src} className="relative aspect-[4/3] overflow-hidden rounded-xl">
                  <ProtectedImage
                    src={src}
                    alt={`Option ${String.fromCharCode(65 + i)}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="absolute left-2 top-2 rounded-full bg-sky-600 px-2.5 py-0.5 text-xs font-bold text-white">
                    {i === 0 ? currentCompare?.labelA ?? "A" : currentCompare?.labelB ?? "B"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className={`grid grid-cols-2 gap-2 ${compact ? "h-full p-2" : ""}`}>
              {currentImages.map((src, i) => (
                <div key={src} className="relative aspect-[4/3] overflow-hidden rounded-xl">
                  <ProtectedImage
                    src={src}
                    alt={`Panel ${i + 1}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
                    {i + 1}
                  </span>
                </div>
              ))}
            </div>
          )
        ) : (
          <PracticeImage
            src={currentImages[0]}
            alt="練習用の写真"
            className="h-full w-full object-cover"
          />
        )
      ) : (
        <div className="flex aspect-[4/3] items-center justify-center text-sm text-stone-500">
          お題がありません
        </div>
      )}
      {recording && (
        <div className="absolute left-3 top-3 badge bg-red-600 text-white">
          REC {secondsLeft}s
        </div>
      )}
      {transcribing && (
        <div className="absolute left-3 top-3 badge bg-stone-800 text-white">解析中...</div>
      )}
    </div>
  );
}
