/** Hiragana, katakana, or CJK — used to detect Japanese mixed into target-language speech. */
const JAPANESE_RE = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/;
const KOREAN_RE = /[\uAC00-\uD7AF]/;

export function containsJapanese(text: string): boolean {
  return JAPANESE_RE.test(text);
}

export function containsKorean(text: string): boolean {
  return KOREAN_RE.test(text);
}

export function containsNativeLanguage(text: string, nativeLanguageId: string): boolean {
  if (nativeLanguageId === "ja-JP") return containsJapanese(text);
  if (nativeLanguageId === "ko-KR") return containsKorean(text);
  if (nativeLanguageId === "zh-CN") return /[\u4E00-\u9FFF]/.test(text) && !containsJapanese(text);
  return false;
}

export function buildTranscribePrompt(languageName: string, nativeLanguageName: string): string {
  return `Transcribe this spoken audio accurately for a language-learning app.
The learner is practicing ${languageName}. Their native language is ${nativeLanguageName}.
They may mix in ${nativeLanguageName} when they forget a word.

Rules:
- Write ${languageName} parts in ${languageName}.
- Keep any ${nativeLanguageName} words or phrases exactly as spoken. Do NOT translate them into ${languageName}.
- Add proper punctuation and split into multiple sentences. Put each sentence on its own line.
- Break at natural speech pauses, breaths, and thought boundaries — not only at the very end.
- Use periods (.), question marks (?), exclamation marks (!), and commas (,) where the speaker pauses or shifts idea.
- Break before/after discourse markers and connectors when spoken.
- Do NOT return the whole recording as one long sentence unless it was truly one short utterance.
- Return only the transcription text. No commentary or translation notes.`;
}

/** True when speech was likely transcribed as one long run-on block. */
export function looksLikeRunOnTranscript(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length < 80) return false;

  const lines = trimmed.split("\n").map((line) => line.trim()).filter(Boolean);
  if (lines.length >= 3) return false;

  const sentenceChunks = trimmed
    .split(/(?<=[.!?。！？])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (sentenceChunks.length >= 3) return false;
  if (sentenceChunks.length === 1 && trimmed.length >= 80) return true;
  if (!/[.!?。！？]/.test(trimmed) && trimmed.length >= 60) return true;

  return lines.length === 1 && trimmed.length >= 120;
}

/** Client-side sentence breaks — avoids a second Gemini round-trip after transcribe. */
export function formatTranscriptLocally(text: string): string {
  const trimmed = text.trim();
  if (!trimmed || !looksLikeRunOnTranscript(trimmed)) return trimmed;

  const byPunctuation = trimmed
    .split(/(?<=[.!?。！？])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (byPunctuation.length >= 2) return byPunctuation.join("\n");

  if (trimmed.length >= 80) {
    return trimmed
      .replace(
        /\s+(And|But|So|Then|Because|However|First|After that|Eventually|Also|Next|Finally)\s+/gi,
        "\n$1 "
      )
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .join("\n");
  }

  return trimmed;
}

export function buildFormatTranscriptPrompt(languageName: string, text: string): string {
  return `This is a spoken ${languageName} transcription from a learner. It was written as one long block without enough sentence breaks.

Add punctuation and split it into natural sentences for feedback review.
Rules:
- Do NOT change, remove, or add words except punctuation.
- Keep any non-${languageName} fragments exactly as written.
- Put each sentence on its own line.
- Break at pauses, clause boundaries, and connectors.
- Return only the formatted transcription. No commentary.

Text:
"""
${text}
"""`;
}

export function codeSwitchFeedbackRules(
  languageName: string,
  nativeLanguageName: string
): string {
  return `
Code-switching rules (${nativeLanguageName} mixed into ${languageName}):
- The learner may insert ${nativeLanguageName} when they forgot a word. Treat it as "wanted to say something in ${languageName}", not as something to ignore.
- Keep "original" exactly as the learner said/wrote, including any ${nativeLanguageName} fragments.
- In "fixed", replace ${nativeLanguageName} fragments with natural ${languageName}. The full sentence should be entirely in ${languageName}.
- In "comment", when ${nativeLanguageName} appears, briefly teach the phrase they needed in ${languageName}.
- Add vocabulary items for words the learner expressed in ${nativeLanguageName}: "term" in ${languageName}, "note" explains it in ${nativeLanguageName}.`;
}
