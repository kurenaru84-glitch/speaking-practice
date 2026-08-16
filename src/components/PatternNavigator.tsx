"use client";

import {
  getCategoryForPattern,
  getPatternsInCategory,
  PATTERN_CATEGORIES,
  type PatternCategoryId,
} from "@/lib/pattern-categories";
import type { PatternId } from "@/lib/patterns";

type Props = {
  patternId: PatternId;
  onPatternChange: (id: PatternId) => void;
  disabled?: boolean;
};

export function PatternNavigator({ patternId, onPatternChange, disabled }: Props) {
  const activeCategory = getCategoryForPattern(patternId);
  const patternsInCategory = getPatternsInCategory(activeCategory);

  function handleCategoryChange(categoryId: PatternCategoryId) {
    const patterns = getPatternsInCategory(categoryId);
    if (!patterns.some((p) => p.id === patternId)) {
      onPatternChange(patterns[0].id);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1 rounded-xl border border-stone-200 bg-stone-100/80 p-1">
        {PATTERN_CATEGORIES.map((category) => {
          const selected = activeCategory === category.id;
          return (
            <button
              key={category.id}
              type="button"
              disabled={disabled}
              onClick={() => handleCategoryChange(category.id)}
              className={`min-w-0 flex-1 rounded-lg px-3 py-2 text-left transition-colors sm:text-center ${
                selected
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <span className="block text-sm font-medium">{category.label}</span>
              <span className="mt-0.5 hidden text-xs text-stone-500 sm:block">{category.description}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        {patternsInCategory.map((pattern) => {
          const selected = patternId === pattern.id;
          return (
            <button
              key={pattern.id}
              type="button"
              disabled={disabled}
              onClick={() => onPatternChange(pattern.id)}
              className={`rounded-xl px-3.5 py-2 text-sm font-medium transition-colors ${
                selected
                  ? "bg-amber-700 text-white"
                  : "border border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50"
              }`}
            >
              {pattern.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
