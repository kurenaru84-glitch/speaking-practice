import type { LearningLanguageId, NativeLanguageId } from "@/lib/languages";

export type UserSettings = {
  learningLanguage: LearningLanguageId;
  nativeLanguage: NativeLanguageId;
};

const STORAGE_KEY = "speaking-practice-settings";

export const DEFAULT_SETTINGS: UserSettings = {
  learningLanguage: "en-US",
  nativeLanguage: "ja-JP",
};

function isLearningLanguageId(value: string): value is LearningLanguageId {
  return ["en-US", "de-DE", "fr-FR", "es-ES", "it-IT", "ko-KR", "zh-CN"].includes(value);
}

function isNativeLanguageId(value: string): value is NativeLanguageId {
  return ["ja-JP", "en-US", "de-DE", "fr-FR", "es-ES", "it-IT", "ko-KR", "zh-CN"].includes(value);
}

export function getSettings(): UserSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<UserSettings>;
    const learningLanguage = parsed.learningLanguage ?? "";
    const nativeLanguage = parsed.nativeLanguage ?? "";
    return {
      learningLanguage: isLearningLanguageId(learningLanguage)
        ? learningLanguage
        : DEFAULT_SETTINGS.learningLanguage,
      nativeLanguage: isNativeLanguageId(nativeLanguage)
        ? nativeLanguage
        : DEFAULT_SETTINGS.nativeLanguage,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: UserSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
