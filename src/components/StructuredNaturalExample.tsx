"use client";

import { useState } from "react";
import type { LanguageId } from "@/lib/languages";
import type { NaturalExample } from "@/lib/types";
import { SelectableText } from "@/components/SelectableText";

type Props = {
  example: NaturalExample;
  index: number;
  language: LanguageId;
  sourceLabel: string;
  allowAdd: boolean;
  onToast: (message: string) => void;
};

export function StructuredNaturalExample({
  example,
  index,
  language,
  sourceLabel,
  allowAdd,
  onToast,
}: Props) {
  const [expanded, setExpanded] = useState(true);
  const hasSections = (example.sections?.length ?? 0) > 0;

  return (
    <div className="rounded-2xl bg-amber-50 p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-amber-900">例 {index + 1}</p>
        {hasSections && (
          <button
            type="button"
            className="text-xs font-medium text-amber-800 hover:underline"
            onClick={() => setExpanded((prev) => !prev)}
          >
            {expanded ? "型を折りたたむ" : "型を見る"}
          </button>
        )}
      </div>

      {hasSections && expanded && (
        <div className="mb-3 space-y-2">
          {example.sections!.map((section) => (
            <details
              key={`${section.key}-${index}`}
              className="group rounded-xl border border-amber-200/80 bg-white/70 px-3 py-2"
              open
            >
              <summary className="cursor-pointer text-xs font-semibold text-amber-900">
                {section.labelJa}
              </summary>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-stone-800">
                {section.text}
              </p>
            </details>
          ))}
        </div>
      )}

      <SelectableText
        text={example.text}
        language={language}
        source={`${sourceLabel} 例${index + 1}`}
        className="whitespace-pre-wrap text-sm leading-7 text-stone-800"
        allowAdd={allowAdd}
        onToast={onToast}
      />
      {example.translationJa && (
        <div className="mt-3 border-t border-amber-200/80 pt-3">
          <p className="mb-1 text-xs font-medium text-stone-500">訳</p>
          <p className="text-sm leading-7 text-stone-600">{example.translationJa}</p>
        </div>
      )}
    </div>
  );
}
