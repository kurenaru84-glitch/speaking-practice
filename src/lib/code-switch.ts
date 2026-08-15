/** Hiragana, katakana, or CJK — used to detect Japanese mixed into target-language speech. */
const JAPANESE_RE = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/;

export function containsJapanese(text: string): boolean {
  return JAPANESE_RE.test(text);
}

export function buildTranscribePrompt(languageName: string): string {
  return `Transcribe this spoken audio accurately for a language-learning app.
The learner is practicing ${languageName} and may mix in Japanese when they forget a word (e.g. "There is a table. I can see 赤い車").

Rules:
- Write ${languageName} parts in ${languageName}.
- Keep any Japanese words or phrases exactly as spoken (hiragana, katakana, or kanji). Do NOT translate Japanese into ${languageName}.
- Add proper punctuation and split into multiple sentences. Put each sentence on its own line.
- Break at natural speech pauses, breaths, and thought boundaries — not only at the very end.
- Use periods (.), question marks (?), exclamation marks (!), and commas (,) where the speaker pauses or shifts idea.
- Break before/after discourse markers and connectors when spoken (e.g. and, but, because, so, first, then, however, also).
- Do NOT return the whole recording as one long sentence unless it was truly one short utterance.
- Keep filler words if clearly spoken (um, uh, like), but still punctuate around them.
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

export function buildFormatTranscriptPrompt(languageName: string, text: string): string {
  return `This is a spoken ${languageName} transcription from a learner. It was written as one long block without enough sentence breaks.

Add punctuation and split it into natural sentences for feedback review.
Rules:
- Do NOT change, remove, or add words except punctuation.
- Keep any Japanese fragments exactly as written.
- Put each sentence on its own line.
- Break at pauses, clause boundaries, and connectors (and, but, because, so, first, then, etc.).
- Return only the formatted transcription. No commentary.

Text:
"""
${text}
"""`;
}

export function codeSwitchFeedbackRules(languageName: string): string {
  return `
Code-switching rules (Japanese mixed into ${languageName}):
- The learner may insert Japanese when they forgot a word. Treat it as "wanted to say something in ${languageName}", not as something to ignore.
- Keep "original" exactly as the learner said/wrote, including any Japanese fragments.
- In "fixed", replace Japanese fragments with natural ${languageName} (e.g. 赤い車 → a red car). The full sentence should be entirely in ${languageName}.
- In "comment", when Japanese appears, briefly teach the phrase they needed (e.g. 「赤い車」は *a red car* と言えます).
- Add vocabulary items for words the learner expressed in Japanese: "term" in ${languageName}, "note" mentions the Japanese they used.`;
}
