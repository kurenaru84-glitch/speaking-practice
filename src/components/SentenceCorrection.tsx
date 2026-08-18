"use client";

import type { LanguageId } from "@/lib/languages";
import { diffWordStrings, renderDiffTokens } from "@/lib/text-diff";
import { SelectableText } from "@/components/SelectableText";
import { SpeakButton } from "@/components/SpeakButton";

type Props = {
  original: string;
  fixed: string;
  language: LanguageId;
  allowAdd: boolean;
  onToast: (message: string) => void;
  speakId: string;
};

function DiffLine({
  segments,
  side,
}: {
  segments: ReturnType<typeof diffWordStrings>["originalSegments"];
  side: "original" | "fixed";
}) {
  return (
    <>
      {segments.map((segment, index) => {
        const text = renderDiffTokens(segment.tokens);
        if (!text) return null;

        if (segment.type === "equal") {
          return (
            <span key={`${side}-${index}-eq`} className="text-stone-800">
              {text}{" "}
            </span>
          );
        }

        if (side === "original" && segment.type === "remove") {
          return (
            <span
              key={`${side}-${index}-rm`}
              className="rounded-sm bg-red-100 px-0.5 font-semibold text-red-700 line-through decoration-red-500"
            >
              {text}{" "}
            </span>
          );
        }

        if (side === "fixed" && segment.type === "add") {
          return (
            <span
              key={`${side}-${index}-add`}
              className="rounded-sm bg-emerald-100 px-0.5 font-semibold text-emerald-800"
            >
              {text}{" "}
            </span>
          );
        }

        return null;
      })}
    </>
  );
}

export function SentenceCorrection({
  original,
  fixed,
  language,
  allowAdd,
  onToast,
  speakId,
}: Props) {
  const needsFix = fixed.trim() !== original.trim();
  const speakText = (needsFix ? fixed : original).trim();

  const body = (() => {
  if (!needsFix) {
    return (
      <SelectableText
        text={original}
        language={language}
        source="フィードバック（原文）"
        className="font-medium text-stone-800"
        allowAdd={allowAdd}
        onToast={onToast}
      />
    );
  }

  const diff = diffWordStrings(original, fixed);

  if (diff.useFallback) {
    return (
      <>
        <SelectableText
          text={original}
          language={language}
          source="フィードバック（原文）"
          className="font-medium text-stone-800"
          allowAdd={allowAdd}
          onToast={onToast}
        />
        <p className="mt-1 font-medium text-emerald-800">
          →{" "}
          <SelectableText
            text={fixed}
            language={language}
            source="フィードバック（修正例）"
            inline
            allowAdd={allowAdd}
            onToast={onToast}
          />
        </p>
      </>
    );
  }

  return (
    <>
      <p className="select-text font-medium leading-7">
        <DiffLine segments={diff.originalSegments} side="original" />
      </p>
      <p className="select-text mt-1 font-medium leading-7">
        <span className="text-stone-500">→ </span>
        <DiffLine segments={diff.fixedSegments} side="fixed" />
      </p>
    </>
  );
  })();

  return (
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0 flex-1">{body}</div>
      {speakText && (
        <SpeakButton
          text={speakText}
          languageId={language}
          speakId={speakId}
          label="例文を読み上げ"
          className="shrink-0"
        />
      )}
    </div>
  );
}
