export type PatternId = "describe" | "story" | "speculate" | "roleplay";

export type Pattern = {
  id: PatternId;
  label: string;
  title: string;
  description: string;
  taskJa: string;
  taskEn: string;
  imageFolder: string;
  multiImage: boolean;
  feedbackButton: string;
  naturalTitle: string;
  emptyImageHint: string;
  navLabel: string;
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
    multiImage: false,
    feedbackButton: "文法と自然な言い方を見る",
    naturalTitle: "こう言うともっと自然",
    emptyImageHint: "public/images/describe に画像を入れてください",
    navLabel: "前の画像",
  },
  {
    id: "story",
    label: "ストーリー",
    title: "ストーリーテリングの練習",
    description: "複数の写真を順番に見て、前後関係のあるストーリーとして語ります。",
    taskJa:
      "4枚の写真を順番に見て、First → Then → After that → Eventually の流れでストーリーを語ってください。なぜそうなったか、因果関係も入れてください。",
    taskEn:
      "Tell the story shown in these panels in order. Use connectors (First, Then, After that, Eventually) and explain cause and effect.",
    imageFolder: "story",
    multiImage: true,
    feedbackButton: "ストーリーと時制をチェック",
    naturalTitle: "こう語るともっと自然",
    emptyImageHint: "public/images/story/セット名/ に 01.jpg などを入れてください",
    navLabel: "前のストーリー",
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
    multiImage: false,
    feedbackButton: "推測と助動詞をチェック",
    naturalTitle: "こう推測すると自然",
    emptyImageHint: "public/images/speculate に画像を入れてください",
    navLabel: "前の画像",
  },
  {
    id: "roleplay",
    label: "ロールプレイ",
    title: "ロールプレイ・アドバイスの練習",
    description: "写真の人物になりきって話すか、相手に直接アドバイス・声かけをします。",
    taskJa:
      "もしあなたがこの状況の人物だったら、何と言いますか？または、この人になんてアドバイス／声かけをしますか？（If I were... で自分の行動を述べ、相手には直接話しかけてください）",
    taskEn:
      'Role-play: If you were this person, what would you say or do? What advice would you give them? Speak directly to the person (e.g. "Excuse me, I am so sorry...").',
    imageFolder: "roleplay",
    multiImage: false,
    feedbackButton: "話し方と仮定法をチェック",
    naturalTitle: "こう言うともっと自然",
    emptyImageHint: "public/images/roleplay に画像を入れてください",
    navLabel: "前の画像",
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
  if (patternId === "story") {
    return `You are a kind language tutor specializing in storytelling and narrative sequencing in ${languageName}.

The learner saw a sequence of photos (panel 1, then 2, then 3, then 4) and told the story in ${languageName}, including cause and effect.

Learner text:
"""
${userText}
"""

Return JSON only, with this shape:
{
  "corrections": [{ "original": "exact phrase from the learner", "fixed": "corrected phrase", "note": "short explanation in Japanese" }],
  "natural": "a natural 60-second spoken story covering ALL panels in order in ${languageName}. Use connectors like First, Then, After that, Eventually, However. Use past/present tenses appropriately. Explain why things happened. 80-160 words, spoken style.",
  "summary": "2-4 sentences in Japanese evaluating: (1) sequencing connectors, (2) tense consistency, (3) logical cause-effect and any story gaps"
}

Rules:
- Focus corrections on connectors, tense shifts, missing causal links, and illogical jumps between panels.
- natural must follow the actual panel sequence shown in the images.
- Keep notes and summary in Japanese.
- Do not wrap the JSON in markdown.`;
  }

  if (patternId === "roleplay") {
    return `You are a kind language tutor specializing in role-play, direct speech, and advice in ${languageName}.

The learner looked at the attached photo and either:
- spoke as if they were someone in the scene (using "If I were...", "I would..."), and/or
- gave advice or spoke directly to a person in the photo.

Learner text:
"""
${userText}
"""

Return JSON only, with this shape:
{
  "corrections": [{ "original": "exact phrase from the learner", "fixed": "corrected phrase", "note": "short explanation in Japanese" }],
  "natural": "a natural 60-second role-play response about THIS photo in ${languageName}. Include direct speech to someone in the scene and use If I were... / I would... where appropriate. Show politeness and practical communication. 80-140 words, spoken style.",
  "summary": "2-4 sentences in Japanese evaluating: (1) subjunctive / conditional (If I were...), (2) direct speech and tone (polite, persuasive), (3) whether the response fits the situation in the photo"
}

Rules:
- Focus corrections on subjunctive, direct address, register (too casual/formal), and unrealistic responses.
- natural must respond to THIS specific photo's situation.
- Keep notes and summary in Japanese.
- Do not wrap the JSON in markdown.`;
  }

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
