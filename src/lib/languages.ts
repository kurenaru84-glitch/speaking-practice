export const LANGUAGES = [
  { id: "en-US", label: "English", promptName: "English" },
  { id: "de-DE", label: "Deutsch", promptName: "German" },
  { id: "fr-FR", label: "Français", promptName: "French" },
  { id: "es-ES", label: "Español", promptName: "Spanish" },
  { id: "it-IT", label: "Italiano", promptName: "Italian" },
  { id: "ko-KR", label: "한국어", promptName: "Korean" },
  { id: "zh-CN", label: "中文", promptName: "Chinese" },
] as const;

export type LanguageId = (typeof LANGUAGES)[number]["id"];

export function getLanguage(id: string) {
  return LANGUAGES.find((lang) => lang.id === id) ?? LANGUAGES[0];
}
