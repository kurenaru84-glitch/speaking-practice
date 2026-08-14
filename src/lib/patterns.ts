import { codeSwitchFeedbackRules, containsJapanese } from "@/lib/code-switch";

export type PatternId = "describe" | "story" | "speculate" | "roleplay" | "compare";

export type Pattern = {
  id: PatternId;
  label: string;
  title: string;
  description: string;
  taskJa: string;
  taskEn: string;
  imageFolder: string;
  multiImage: boolean;
  imageLayout: "single" | "sequence" | "compare" | "roleplay";
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
    imageLayout: "single",
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
    imageLayout: "sequence",
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
    imageLayout: "single",
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
    imageLayout: "roleplay",
    feedbackButton: "話し方と仮定法をチェック",
    naturalTitle: "こう言うともっと自然",
    emptyImageHint: "public/images/roleplay/カテゴリ名/ に画像を入れ、npm run generate:roleplay で問いかけを生成してください",
    navLabel: "前のシーン",
  },
  {
    id: "compare",
    label: "比較・意見",
    title: "比較して意見を述べる練習",
    description: "2枚の写真を比べて、A と B どちらが良いか理由とともに述べます。",
    taskJa:
      "A と B の写真を比べて、どちらが良いか（またはどちらを選ぶか）を選び、メリット・デメリットを交えて理由を述べてください。（On the one hand... On the other hand... Therefore...）",
    taskEn:
      "Compare photos A and B. Choose which you prefer and explain why, using pros and cons (On the one hand... On the other hand... Therefore...).",
    imageFolder: "compare",
    multiImage: true,
    imageLayout: "compare",
    feedbackButton: "比較と論理構成をチェック",
    naturalTitle: "こう述べるともっと自然",
    emptyImageHint: "public/images/compare/セット名/ に a.jpg と b.jpg を入れてください",
    navLabel: "前の比較",
  },
];

export function getPattern(id: string): Pattern {
  return PATTERNS.find((p) => p.id === id) ?? PATTERNS[0];
}

const SHARED_RULES = `
Sentence feedback rules:
- Split the learner text into sentences. Create one "sentences" entry per sentence. Never skip a sentence.
- "comment" is always in Japanese (1-2 short sentences).
- If the sentence is good, set "fixed" equal to "original" and praise in comment (e.g. よくできていますね / 自然です).
- If correction is needed, put the corrected sentence in "fixed" and explain why in "comment".
- You may also give brief advice in "comment" even when grammar is fine.

Vocabulary rules:
- Add 5-10 "vocabulary" items: words or short phrases in the target language that fit THIS image/scene.
- "term" is in the learner's target language. "note" is a short Japanese explanation (what it means or when to use it).
- Pick practical scene vocabulary (people, objects, actions, places), not generic words.

Natural examples rules:
- Provide exactly 2 entries in "natural". Two different but equally good ways to say it (different wording or emphasis).
- Each entry has "text" in the target language and "translationJa": a natural Japanese translation of that example (not word-for-word if unnatural).

General:
- Do not wrap JSON in markdown.`;

function sharedRules(languageName: string): string {
  return `${SHARED_RULES}${codeSwitchFeedbackRules(languageName)}`;
}

function buildJsonShape(languageName: string, naturalHint: string, summaryHint: string) {
  return `{
  "sentences": [
    {
      "original": "one learner sentence exactly as spoken/written",
      "fixed": "corrected sentence in ${languageName}, or same as original if already good",
      "comment": "reaction in Japanese: correction, advice, or praise"
    }
  ],
  "natural": [
    {
      "text": "${naturalHint}",
      "translationJa": "natural Japanese translation of example 1"
    },
    {
      "text": "A second alternative natural example in ${languageName}. Different wording or angle from the first, same quality. 80-140 words, spoken style.",
      "translationJa": "natural Japanese translation of example 2"
    }
  ],
  "vocabulary": [
    { "term": "useful word or phrase in ${languageName}", "note": "short Japanese explanation" }
  ],
  "summary": "${summaryHint}"
}`;
}

export function buildFeedbackPrompt(
  patternId: PatternId,
  languageName: string,
  userText: string,
  scenario?: { promptJa: string; promptEn: string; labelA?: string; labelB?: string }
): string {
  const codeSwitchNote = containsJapanese(userText)
    ? "\nThis transcript contains Japanese mixed in — the learner likely forgot vocabulary. Help them express it in the target language.\n"
    : "";

  const intro = `You are a kind, encouraging language tutor. Always react to EVERY sentence the learner said.
${codeSwitchNote}
Learner text:
"""
${userText}
"""`;

  if (patternId === "story") {
    return `${intro}

The learner saw photos in order (panel 1 → 2 → 3 → 4) and told the story in ${languageName}.

Return JSON only:
${buildJsonShape(
  languageName,
  `A natural 60-second spoken story covering ALL panels in order in ${languageName}. Use First, Then, After that, Eventually, However. 80-160 words, spoken style.`,
  "2-4 sentences in Japanese on connectors, tense consistency, and cause-effect logic"
)}

Focus sentence comments on: connectors, tense, causal links, story gaps.
${sharedRules(languageName)}`;
  }

  if (patternId === "compare") {
    const topicBlock = scenario
      ? `
Comparison topic shown to the learner:
- Japanese: ${scenario.promptJa}
- English: ${scenario.promptEn}
- Option A: ${scenario.labelA ?? "A"}
- Option B: ${scenario.labelB ?? "B"}`
      : "";

    return `${intro}
${topicBlock}

The learner compared Image A and Image B in ${languageName} and stated a preference.

Return JSON only:
${buildJsonShape(
  languageName,
  `A natural 60-second comparison in ${languageName}. Choose A or B clearly. Use On the one hand... On the other hand... Therefore... 80-140 words.`,
  "2-4 sentences in Japanese on comparison structure, vocabulary specificity, and clear reasoning"
)}

Focus sentence comments on: comparison phrases, vague words, missing conclusion.
Vocabulary: comparison words and scene-specific terms for both images.
${sharedRules(languageName)}`;
  }

  if (patternId === "roleplay") {
    const scenarioBlock = scenario
      ? `
Scenario shown to the learner:
- Japanese: ${scenario.promptJa}
- English: ${scenario.promptEn}

Evaluate whether the learner's response fits THIS scenario. They should speak directly to the person in the photo.`
      : "";

    return `${intro}
${scenarioBlock}

The learner did role-play or gave advice about the photo in ${languageName}.

Return JSON only:
${buildJsonShape(
  languageName,
  `A natural 60-second role-play in ${languageName}. Use If I were... / I would... and direct speech. Polite and practical. 80-140 words.`,
  "2-4 sentences in Japanese on subjunctive, tone, and situational fit"
)}

Focus sentence comments on: subjunctive, direct address, register, realism.
${sharedRules(languageName)}`;
  }

  if (patternId === "speculate") {
    return `${intro}

The learner speculated about the photo in ${languageName} (why, before, next).

Return JSON only:
${buildJsonShape(
  languageName,
  `A natural 60-second speculation in ${languageName}. Use must/might/could with visible evidence. 80-140 words.`,
  "2-4 sentences in Japanese on modality usage and logical grounding"
)}

Focus sentence comments on: modal verbs, unsupported leaps.
${sharedRules(languageName)}`;
  }

  return `${intro}

The learner described the photo in ${languageName}.

Return JSON only:
${buildJsonShape(
  languageName,
  `A natural 60-second description of THIS photo in ${languageName}. 80-140 words, spoken style.`,
  "2-4 sentences of overall feedback in Japanese"
)}

Focus sentence comments on grammar, word choice, and clarity.
${sharedRules(languageName)}`;
}
