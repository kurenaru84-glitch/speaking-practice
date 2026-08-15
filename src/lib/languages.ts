export type LanguageDef = {
  id: string;
  label: string;
  promptName: string;
};

export const LANGUAGE_CATALOG: Record<string, LanguageDef> = {
  "en-US": { id: "en-US", label: "English", promptName: "English" },
  "de-DE": { id: "de-DE", label: "Deutsch", promptName: "German" },
  "fr-FR": { id: "fr-FR", label: "Français", promptName: "French" },
  "es-ES": { id: "es-ES", label: "Español", promptName: "Spanish" },
  "it-IT": { id: "it-IT", label: "Italiano", promptName: "Italian" },
  "ko-KR": { id: "ko-KR", label: "한국어", promptName: "Korean" },
  "zh-CN": { id: "zh-CN", label: "中文", promptName: "Chinese" },
  "ja-JP": { id: "ja-JP", label: "日本語", promptName: "Japanese" },
};

export const LEARNING_LANGUAGE_IDS = [
  "en-US",
  "de-DE",
  "fr-FR",
  "es-ES",
  "it-IT",
  "ko-KR",
  "zh-CN",
] as const;

export const NATIVE_LANGUAGE_IDS = [
  "ja-JP",
  "en-US",
  "de-DE",
  "fr-FR",
  "es-ES",
  "it-IT",
  "ko-KR",
  "zh-CN",
] as const;

export type LearningLanguageId = (typeof LEARNING_LANGUAGE_IDS)[number];
export type NativeLanguageId = (typeof NATIVE_LANGUAGE_IDS)[number];

/** @deprecated use LearningLanguageId */
export type LanguageId = LearningLanguageId;

export const LEARNING_LANGUAGES = LEARNING_LANGUAGE_IDS.map((id) => LANGUAGE_CATALOG[id]);
export const NATIVE_LANGUAGES = NATIVE_LANGUAGE_IDS.map((id) => LANGUAGE_CATALOG[id]);

/** @deprecated use LEARNING_LANGUAGES */
export const LANGUAGES = LEARNING_LANGUAGES;

export function getLanguage(id: string): LanguageDef {
  return LANGUAGE_CATALOG[id] ?? LANGUAGE_CATALOG["en-US"];
}

export function getLearningLanguage(id: string): LanguageDef {
  if (LEARNING_LANGUAGE_IDS.includes(id as LearningLanguageId)) {
    return LANGUAGE_CATALOG[id];
  }
  return LANGUAGE_CATALOG["en-US"];
}

export function getNativeLanguage(id: string): LanguageDef {
  if (NATIVE_LANGUAGE_IDS.includes(id as NativeLanguageId)) {
    return LANGUAGE_CATALOG[id];
  }
  return LANGUAGE_CATALOG["ja-JP"];
}
