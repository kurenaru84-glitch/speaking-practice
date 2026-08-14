export type RoleplayMetaImage = {
  file: string;
  promptJa: string;
  promptEn?: string;
};

export type RoleplayMeta = {
  categoryJa: string;
  categoryEn?: string;
  images: RoleplayMetaImage[];
};

export type RoleplayScenario = {
  id: string;
  categoryId: string;
  categoryJa: string;
  categoryEn: string;
  image: string;
  promptJa: string;
  promptEn: string;
};

export const ROLEPLAY_CATEGORY_LABELS: Record<string, { ja: string; en: string }> = {
  comfort: { ja: "慰め・励まし", en: "Comfort & encouragement" },
  "customer-trouble": { ja: "接客・トラブル対応", en: "Customer service & trouble" },
  help: { ja: "道案内・助え合い", en: "Directions & helping others" },
  advice: { ja: "提案・アドバイス", en: "Suggestions & advice" },
  apology: { ja: "謝罪・許し", en: "Apology & forgiveness" },
  uncategorized: { ja: "その他", en: "Other scenarios" },
};

export function defaultCategoryLabels(categoryId: string) {
  return (
    ROLEPLAY_CATEGORY_LABELS[categoryId] ?? {
      ja: categoryId,
      en: categoryId,
    }
  );
}

export function defaultRoleplayPrompt(categoryJa: string) {
  return {
    promptJa: `${categoryJa}の場面です。写真の人物に直接話しかけてください。何と言いますか？`,
    promptEn: `This is a ${categoryJa} situation. Speak directly to the person in the photo. What would you say?`,
  };
}
