"use client";

import {
  getCategoryForPattern,
  getPatternsInCategory,
  getSubcategoriesForPattern,
  PATTERN_CATEGORIES,
  type ContentSubcategoryId,
  type PatternCategoryId,
} from "@/lib/pattern-categories";
import type { PatternId } from "@/lib/patterns";

type Props = {
  patternId: PatternId;
  onPatternChange: (id: PatternId) => void;
  subcategoryId?: ContentSubcategoryId | null;
  onSubcategoryChange?: (id: ContentSubcategoryId) => void;
  disabled?: boolean;
};

export function PatternNavigator({
  patternId,
  onPatternChange,
  subcategoryId,
  onSubcategoryChange,
  disabled,
}: Props) {
  const activeCategory = getCategoryForPattern(patternId);
  const patternsInCategory = getPatternsInCategory(activeCategory);
  const subcategories = getSubcategoriesForPattern(patternId);

  function handleCategoryChange(categoryId: PatternCategoryId) {
    const patterns = getPatternsInCategory(categoryId);
    if (!patterns.some((p) => p.id === patternId)) {
      onPatternChange(patterns[0].id);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-0 border-b border-stone-200">
        {PATTERN_CATEGORIES.map((category) => {
          const selected = activeCategory === category.id;
          return (
            <button
              key={category.id}
              type="button"
              disabled={disabled}
              onClick={() => handleCategoryChange(category.id)}
              className={`relative min-w-0 flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
                selected ? "text-stone-900" : "text-stone-500 hover:text-stone-700"
              }`}
            >
              {category.label}
              {selected && (
                <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-amber-700" />
              )}
            </button>
          );
        })}
      </div>

      <div className="-mx-1 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max min-w-full gap-2">
          {patternsInCategory.map((pattern) => {
            const selected = patternId === pattern.id;
            return (
              <button
                key={pattern.id}
                type="button"
                disabled={disabled}
                onClick={() => onPatternChange(pattern.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  selected
                    ? "bg-amber-700 text-white shadow-sm"
                    : "border border-stone-200 bg-white text-stone-700 hover:border-stone-300"
                }`}
              >
                {pattern.label}
              </button>
            );
          })}
        </div>
      </div>

      {subcategories && onSubcategoryChange && (
        <div className="-mx-1 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex w-max min-w-full gap-2">
            {subcategories.map((sub) => {
              const selected = subcategoryId === sub.id;
              return (
                <button
                  key={sub.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => onSubcategoryChange(sub.id)}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    selected
                      ? "bg-stone-800 text-white"
                      : "border border-stone-200 bg-white text-stone-600 hover:border-stone-300"
                  }`}
                >
                  {sub.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
