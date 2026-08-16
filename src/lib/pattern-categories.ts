import { PATTERNS, type PatternId } from "@/lib/patterns";
import type { EmailContext } from "@/lib/email-context";
import type { InterviewContext } from "@/lib/interview-context";

export type PatternCategoryId = "speaking" | "writing" | "interview";

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

export const SUBCATEGORIES_BY_CATEGORY: Record<PatternCategoryId, ContentSubcategory[] | null> = {
  speaking: null,
  writing: [
    { id: "business", label: "ビジネス" },
    { id: "personal", label: "プライベート" },
  ],
  interview: [
    { id: "personal", label: "自分について" },
    { id: "behavioral", label: "面接" },
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

export function getDefaultSubcategory(categoryId: PatternCategoryId): ContentSubcategoryId | null {
  const subs = SUBCATEGORIES_BY_CATEGORY[categoryId];
  return subs?.[0]?.id ?? null;
}

export function getSubcategoriesForCategory(categoryId: PatternCategoryId) {
  return SUBCATEGORIES_BY_CATEGORY[categoryId];
}
