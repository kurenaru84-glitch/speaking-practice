export type PatternId = "describe" | "speculate";

export type Pattern = {
  id: PatternId;
  label: string;
  title: string;
  description: string;
  taskJa: string;
  taskEn: string;
  imageFolder: string;
  feedbackButton: string;
  naturalTitle: string;
  emptyImageHint: string;
};

export const PATTERNS: Pattern[] = [
  {
    id: "describe",
    label: "状況説明",
    title: "画像を見て 1 分で説明する練習",
    description: "写真に写っている状況を、そのまま説明します。",
    taskJa: "この写真に何が写っているか、誰が何をしているかを説明してください。",
    taskEn: "Describe what is happening in this photo.",
    imageFolder: "describe",
    feedbackButton: "文法と自然な言い方を見る",
    naturalTitle: "こう言うともっと自然",
    emptyImageHint: "public/images/describe に画像を入れてください",
  },
  {
    id: "speculate",
    label: "推測・予測",
    title: "画像から推測・予測する練習",
    description: "写っていない「前後」や「理由」を must / might / could で推測します。",
    taskJa:
      "なぜこうなったのか、直前に何があったか、これから何が起きそうかを推測して話してください。（must / might / could などを使う）",
    taskEn:
      "Speculate: Why might this be happening? What probably happened before? What might happen next?",
    imageFolder: "speculate",
    feedbackButton: "推測と助動詞をチェック",
    naturalTitle: "こう推測すると自然",
    emptyImageHint: "public/images/speculate に画像を入れてください",
  },
];

export function getPattern(id: string): Pattern {
  return PATTERNS.find((p) => p.id === id) ?? PATTERNS[0];
}

export function buildFeedbackPrompt(
  patternId: PatternId,
  languageName: string,
  userText: string
): string {
  if (patternId === "speculate") {
    return `You are a kind language tutor specializing in speculation and modality in ${languageName}.

The learner looked at the attached photo and speculated about what might be happening, what probably happened before, and what might happen next.

Learner text:
"""
${userText}
"""

Return JSON only, with this shape:
{
  "corrections": [{ "original": "exact phrase from the learner", "fixed": "corrected phrase", "note": "short explanation in Japanese" }],
  "natural": "a natural 60-second spoken speculation about THIS photo in ${languageName}. Use must/might/could/may/can't appropriately to show confidence levels. Mention what you see as evidence. 80-140 words, spoken style.",
  "summary": "2-4 sentences in Japanese evaluating: (1) modality usage (must be, might be, could have been, etc.), (2) whether speculation is grounded in visible evidence, (3) any logical leaps"
}

Rules:
- Focus corrections on modal verbs, speculation grammar, and unsupported leaps.
- If modality is already good, corrections may be empty or minimal.
- natural must speculate about THIS specific photo, not a generic scene.
- Keep notes and summary in Japanese.
- Do not wrap the JSON in markdown.`;
  }

  return `You are a kind language tutor. The learner described the attached photo in ${languageName} for about 1 minute.

Learner text:
"""
${userText}
"""

Return JSON only, with this shape:
{
  "corrections": [{ "original": "exact phrase from the learner", "fixed": "corrected phrase", "note": "short explanation in Japanese" }],
  "natural": "a natural 60-second spoken description of THIS photo in ${languageName}. Write as spoken language, 80-140 words.",
  "summary": "2-4 sentences of overall feedback in Japanese"
}

Rules:
- If the text is already good, corrections may be an empty array.
- natural must describe the actual photo, not a generic scene.
- Keep notes and summary in Japanese.
- Do not wrap the JSON in markdown.`;
}
