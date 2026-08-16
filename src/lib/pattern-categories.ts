import { PATTERNS, type PatternId } from "@/lib/patterns";
import type { EmailContext } from "@/lib/email-context";
import type { InterviewContext } from "@/lib/interview-context";

export type PatternCategoryId = "speaking" | "writing";

export type PatternCategory = {
  id: PatternCategoryId;
  label: string;
  description: string;
};

export type ContentSubcategoryId = EmailContext | InterviewContext;

export type ContentSubcategory = {
  id: ContentSubcategoryId;
  label: string;
};

export const PATTERN_CATEGORIES: PatternCategory[] = [
  {
    id: "speaking",
    label: "スピーキング",
    description: "画像や質問に答える練習",
  },
  {
    id: "writing",
    label: "ライティング",
    description: "メールの作成・返信",
  },
];

export const PATTERNS_BY_CATEGORY: Record<PatternCategoryId, PatternId[]> = {
  speaking: ["describe", "story", "speculate", "roleplay", "compare", "interview"],
  writing: ["email"],
};

const SUBCATEGORIES_BY_PATTERN: Partial<Record<PatternId, ContentSubcategory[]>> = {
  interview: [
    { id: "personal", label: "自分について" },
    { id: "behavioral", label: "面接" },
  ],
  email: [
    { id: "business", label: "ビジネス" },
    { id: "personal", label: "プライベート" },
  ],
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

export function getSubcategoriesForPattern(patternId: PatternId) {
  return SUBCATEGORIES_BY_PATTERN[patternId] ?? null;
}

export function getDefaultSubcategoryForPattern(patternId: PatternId): ContentSubcategoryId | null {
  const subs = getSubcategoriesForPattern(patternId);
  return subs?.[0]?.id ?? null;
}

/** @deprecated use getDefaultSubcategoryForPattern */
export function getDefaultSubcategory(categoryId: PatternCategoryId): ContentSubcategoryId | null {
  if (categoryId === "writing") return "business";
  return "personal";
}

/** @deprecated use getSubcategoriesForPattern */
export function getSubcategoriesForCategory(categoryId: PatternCategoryId) {
  if (categoryId === "writing") return SUBCATEGORIES_BY_PATTERN.email ?? null;
  return null;
}
