import { PATTERNS, type PatternId } from "@/lib/patterns";

export type PatternCategoryId = "speaking" | "writing" | "interview";

export type PatternCategory = {
  id: PatternCategoryId;
  label: string;
  description: string;
};

export const PATTERN_CATEGORIES: PatternCategory[] = [
  {
    id: "speaking",
    label: "スピーキング",
    description: "画像を見て話す練習",
  },
  {
    id: "writing",
    label: "ライティング",
    description: "メールの作成・返信",
  },
  {
    id: "interview",
    label: "面接・会話",
    description: "質問に答える練習",
  },
];

export const PATTERNS_BY_CATEGORY: Record<PatternCategoryId, PatternId[]> = {
  speaking: ["describe", "story", "speculate", "roleplay", "compare"],
  writing: ["email"],
  interview: ["interview"],
};

export function getCategoryForPattern(patternId: PatternId): PatternCategoryId {
  for (const category of PATTERN_CATEGORIES) {
    if (PATTERNS_BY_CATEGORY[category.id].includes(patternId)) {
      return category.id;
    }
  }
  return "speaking";
}

export function getPatternsInCategory(categoryId: PatternCategoryId) {
  return PATTERNS_BY_CATEGORY[categoryId].map((id) => PATTERNS.find((p) => p.id === id)!);
}
