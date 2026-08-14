/** Hiragana, katakana, or CJK — used to detect Japanese mixed into target-language speech. */
const JAPANESE_RE = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/;

export function containsJapanese(text: string): boolean {
  return JAPANESE_RE.test(text);
}

export function buildTranscribePrompt(languageName: string): string {
  return `Transcribe this spoken audio accurately.
The learner is practicing ${languageName} and may mix in Japanese when they forget a word (e.g. "There is a table. I can see 赤い車").

Rules:
- Write ${languageName} parts in ${languageName}.
- Keep any Japanese words or phrases exactly as spoken (hiragana, katakana, or kanji). Do NOT translate Japanese into ${languageName}.
- Return only the transcription text. No commentary or translation notes.
- Keep filler words and natural spoken phrasing.`;
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
