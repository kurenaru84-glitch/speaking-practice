const FILLER_PATTERN =
  /^(yes|yeah|yep|yup|yea|ok|okay|well|um+|uh+|er+|hmm+|hm+|like|right|sure|no|nope|so|and|but|oh|ah|mhm|mm+|yeah\.|yes\.|ok\.|well\.)[.!?,…]*$/i;

const JAPANESE_FILLER_PATTERN =
  /^(えー+|あのー+|うん|はい|ええ|そう|まあ|ん+|え+|あー+)[。！？…]*$/u;

export function shouldSkipSentenceFeedback(sentence: string): boolean {
  const trimmed = sentence.trim();
  if (!trimmed) return true;

  if (FILLER_PATTERN.test(trimmed) || JAPANESE_FILLER_PATTERN.test(trimmed)) {
    return true;
  }

  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length <= 1 && trimmed.length <= 12) return true;
  if (words.length <= 2 && trimmed.length <= 6) return true;

  return false;
}

export function filterFeedbackSentences<T extends { original: string }>(sentences: T[]): T[] {
  return sentences.filter((s) => !shouldSkipSentenceFeedback(s.original));
}
