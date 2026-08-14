import type { LanguageId } from "@/lib/languages";

export async function fetchJapaneseTranslation(
  text: string,
  language: LanguageId
): Promise<string> {
  const res = await fetch("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, language }),
  });
  const data = (await res.json()) as { translationJa?: string; error?: string };
  if (!res.ok) throw new Error(data.error ?? "翻訳に失敗しました。");
  const translation = data.translationJa?.trim();
  if (!translation) throw new Error("翻訳結果が空でした。");
  return translation;
}
