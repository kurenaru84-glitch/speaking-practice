import { codeSwitchFeedbackRules, containsNativeLanguage } from "@/lib/code-switch";

export type PatternId = "describe" | "story" | "speculate" | "roleplay" | "compare" | "interview" | "email";

export type Pattern = {
  id: PatternId;
  label: string;
  title: string;
  description: string;
  taskJa: string;
  taskEn: string;
  imageFolder: string;
  multiImage: boolean;
  imageLayout: "single" | "sequence" | "compare" | "roleplay" | "interview" | "email";
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
  {
    id: "interview",
    label: "インタビュー",
    title: "インタビュー練習",
    description: "面接官の質問に1分ほど答える練習です。経験・背景・価値観を語る質問向け（AとBの比較・意見表明は「比較・意見」パターンを使ってください）。",
    taskJa: "質問に対して、具体例と理由を交えて1分ほど答えてください。",
    taskEn: "Answer the interview question for about one minute. Include specific examples and reasons.",
    imageFolder: "interview",
    multiImage: false,
    imageLayout: "interview",
    feedbackButton: "答え方と構成をチェック",
    naturalTitle: "こう答えるともっと自然",
    emptyImageHint: "public/images/interview/カテゴリ名/meta.json に質問を追加してください",
    navLabel: "前の質問",
  },
  {
    id: "email",
    label: "メール",
    title: "ビジネスメール練習",
    description: "場面に合わせてメールを書く、または届いたメールに返信する練習です。件名・挨拶・本文・結びを意識してください。",
    taskJa: "指示に従って、適切なトーンでメールを書いてください。",
    taskEn: "Write an email following the instructions, using an appropriate tone and clear structure.",
    imageFolder: "email",
    multiImage: false,
    imageLayout: "email",
    feedbackButton: "メールの構成と表現をチェック",
    naturalTitle: "こう書くともっと自然",
    emptyImageHint: "public/images/email/カテゴリ名/meta.json にシナリオを追加してください",
    navLabel: "前のメール",
  },
];

export function getPattern(id: string): Pattern {
  return PATTERNS.find((p) => p.id === id) ?? PATTERNS[0];
}

const GRADE_RULES = (nativeLanguageName: string) => `
Grade rules:
- Assign exactly one overall letter grade: "A", "B", "C", "D", or "E". No numeric score.
- Be warm and encouraging. The learner should feel motivated to try again, never discouraged.
- gradeNote must be 1-2 short sentences in ${nativeLanguageName}, ALWAYS in this order:
  1) Start with genuine praise for what they did well (effort, clarity, vocabulary used, task attempt, etc.)
  2) If improvement is needed, frame it gently as "次の一歩" / "もう一歩" — never harsh or discouraging language.
- Grade meanings (for your internal use; do NOT repeat these labels verbatim in gradeNote):
  - A = excellent overall
  - B = solid attempt; mostly clear with room to polish expression
  - C = message gets through; building blocks are there
  - D = early stage but effort visible; needs simpler structure
  - E = very first steps; praise the attempt itself
- Example gradeNote tones:
  - A: "内容がよく伝わっていて、とても自然な説明でした。この調子で続けましょう。"
  - B: "しっかり説明できています。表現を少し豊かにすると、さらに自然になりますよ。"
  - C: "伝えたいことは伝わっています。次は文型を整えると、もっと自信を持って話せます。"
  - D: "話そうとしている姿勢が伝わります。短い文から一緒に積み上げていきましょう。"
  - E: "まずは話してみた、それが大切な一歩です。キーワードだけでもOK。次は1文ずつ増やしていきましょう。"
- Never use words like "問題", "ダメ", "伝わらない", "不足" in gradeNote.`;

function gradeJsonFields(nativeLanguageName: string) {
  return `
  "grade": "A" | "B" | "C" | "D" | "E",
  "gradeNote": "1-2 warm, encouraging sentences in ${nativeLanguageName} (praise first, then gentle next step)",`;
}

const SHARED_RULES = (nativeLanguageName: string) => `
${GRADE_RULES(nativeLanguageName)}
Sentence feedback rules:
- Split the learner text into sentences. Create one "sentences" entry per substantive sentence.
- SKIP fillers, discourse markers, and standalone short responses (e.g. "Yes", "Um", "Well", "Yeah", "OK", "えー", "うん", "はい"). Do NOT create entries for them.
- "comment" is always in ${nativeLanguageName} (1-2 short sentences).
- If the sentence is good, set "fixed" equal to "original" and praise in comment.
- If correction is needed, put the corrected sentence in "fixed" and explain why in "comment".
- You may also give brief advice in "comment" even when grammar is fine.

Vocabulary rules:
- Add 5-10 "vocabulary" items: words or short phrases in the target language that fit THIS image/scene.
- "term" is in the learner's target language. "note" is a short ${nativeLanguageName} explanation (what it means or when to use it).
- Pick practical scene vocabulary (people, objects, actions, places), not generic words.

Natural examples rules:
- Provide exactly 2 entries in "natural". Two different but equally good ways to say it (different wording or emphasis).
- Each entry has "text" in the target language and "translationJa": a natural ${nativeLanguageName} translation of that example (not word-for-word if unnatural).

General:
- Do not wrap JSON in markdown.`;

function sharedRules(languageName: string, nativeLanguageName: string): string {
  return `${SHARED_RULES(nativeLanguageName)}${codeSwitchFeedbackRules(languageName, nativeLanguageName)}`;
}

function buildJsonShape(
  languageName: string,
  nativeLanguageName: string,
  naturalHint: string,
  summaryHint: string
) {
  return `{
  "sentences": [
    {
      "original": "one learner sentence exactly as spoken/written",
      "fixed": "corrected sentence in ${languageName}, or same as original if already good",
      "comment": "reaction in ${nativeLanguageName}: correction, advice, or praise"
    }
  ],
  "natural": [
    {
      "text": "${naturalHint}",
      "translationJa": "natural ${nativeLanguageName} translation of example 1"
    },
    {
      "text": "A second alternative natural example in ${languageName}. Different wording or angle from the first, same quality. 80-140 words, spoken style.",
      "translationJa": "natural ${nativeLanguageName} translation of example 2"
    }
  ],
  "vocabulary": [
    { "term": "useful word or phrase in ${languageName}", "note": "short ${nativeLanguageName} explanation" }
  ],${gradeJsonFields(nativeLanguageName)}
  "summary": "${summaryHint}"
}`;
}

const INTERVIEW_CHECKLIST = [
  { id: "has_specific_example", labelJa: "具体例がある" },
  { id: "explains_reason", labelJa: "理由・背景を説明している" },
  { id: "has_conclusion", labelJa: "結論・まとめがある" },
  { id: "good_length", labelJa: "1分程度の長さ（十分な情報量）" },
] as const;

const EMAIL_COMPOSE_CHECKLIST = [
  { id: "has_subject", labelJa: "件名がある" },
  { id: "has_greeting", labelJa: "適切な挨拶がある" },
  { id: "purpose_clear", labelJa: "用件・目的が明確" },
  { id: "has_closing", labelJa: "結びの挨拶がある" },
] as const;

const EMAIL_REPLY_CHECKLIST = [
  { id: "has_subject", labelJa: "件名がある" },
  { id: "has_greeting", labelJa: "適切な挨拶がある" },
  { id: "answers_all_points", labelJa: "相手の質問・依頼すべてに回答" },
  { id: "has_closing", labelJa: "結びの挨拶がある" },
] as const;

const INTERVIEW_SECTIONS = [
  { key: "opening", labelJa: "導入" },
  { key: "example", labelJa: "具体例" },
  { key: "reason", labelJa: "理由" },
  { key: "closing", labelJa: "結び" },
] as const;

const EMAIL_SECTIONS = [
  { key: "subject", labelJa: "件名" },
  { key: "greeting", labelJa: "挨拶" },
  { key: "body", labelJa: "本文" },
  { key: "closing", labelJa: "結び" },
] as const;

function buildStructuredJsonShape(
  languageName: string,
  nativeLanguageName: string,
  naturalHint: string,
  summaryHint: string,
  checklist: ReadonlyArray<{ id: string; labelJa: string }>,
  sections: ReadonlyArray<{ key: string; labelJa: string }>,
  includeGrowthNote: boolean
) {
  const checklistLines = checklist
    .map(
      (item) =>
        `    { "id": "${item.id}", "labelJa": "${item.labelJa}", "passed": true or false, "note": "optional brief note in ${nativeLanguageName}" }`
    )
    .join(",\n");

  const sectionLines = sections
    .map(
      (section) =>
        `        { "key": "${section.key}", "labelJa": "${section.labelJa}", "text": "this part in ${languageName}" }`
    )
    .join(",\n");

  const naturalEntry = `{
      "text": "${naturalHint}",
      "translationJa": "natural ${nativeLanguageName} translation of the full example",
      "sections": [
${sectionLines}
      ]
    }`;

  return `{
  "sentences": [
    {
      "original": "one learner sentence exactly as spoken/written",
      "fixed": "corrected sentence in ${languageName}, or same as original if already good",
      "comment": "reaction in ${nativeLanguageName}: correction, advice, or praise"
    }
  ],
  "natural": [
    ${naturalEntry},
    {
      "text": "A second alternative example in ${languageName}. Same structure quality, different wording.",
      "translationJa": "natural ${nativeLanguageName} translation of example 2",
      "sections": [
${sectionLines}
      ]
    }
  ],
  "checklist": [
${checklistLines}
  ],${
    includeGrowthNote
      ? `
  "growthNote": "1-2 sentences in ${nativeLanguageName} comparing THIS attempt to the learner's PREVIOUS attempt on the same question. Mention concrete improvements (e.g. more examples, better connectors) or what still needs work.",`
      : ""
  }
  "vocabulary": [
    { "term": "useful word or phrase in ${languageName}", "note": "short ${nativeLanguageName} explanation" }
  ],${gradeJsonFields(nativeLanguageName)}
  "summary": "${summaryHint}"
}`;
}

export type PreviousAttemptContext = {
  userText: string;
  checklistSummary?: string;
};

export type FeedbackScenario = {
  promptJa: string;
  promptEn: string;
  labelA?: string;
  labelB?: string;
  emailType?: "compose" | "reply";
  incomingEmailJa?: string;
  incomingEmailEn?: string;
};

function buildFeedbackIntro(
  nativeLanguageName: string,
  nativeLanguageId: string,
  userText: string,
  previousAttempt?: PreviousAttemptContext
): string {
  const previousBlock = previousAttempt
    ? `
The learner's PREVIOUS attempt on this same question (for comparison):
"""
${previousAttempt.userText}
"""${previousAttempt.checklistSummary ? `\nPrevious checklist score: ${previousAttempt.checklistSummary}` : ""}
`
    : "";

  const codeSwitchNote = containsNativeLanguage(userText, nativeLanguageId)
    ? `\nThis transcript contains ${nativeLanguageName} mixed in — the learner likely forgot vocabulary. Help them express it in the target language.\n`
    : "";

  return `You are a kind, encouraging language tutor. Always react to EVERY sentence the learner said.
The learner's native language is ${nativeLanguageName}. All comments, notes, summaries, and translationJa fields must be in ${nativeLanguageName}.
${codeSwitchNote}${previousBlock}
Learner text:
"""
${userText}
"""`;
}

function buildQuickJsonShape(
  nativeLanguageName: string,
  summaryHint: string,
  checklist?: ReadonlyArray<{ id: string; labelJa: string }>
) {
  const checklistLines = checklist
    ? checklist
        .map(
          (item) =>
            `    { "id": "${item.id}", "labelJa": "${item.labelJa}", "passed": true or false, "note": "optional brief note in ${nativeLanguageName}" }`
        )
        .join(",\n")
    : "";

  const checklistBlock = checklist
    ? `
  "checklist": [
${checklistLines}
  ],`
    : "";

  return `{${checklistBlock}${gradeJsonFields(nativeLanguageName)}
  "summary": "${summaryHint}"
}`;
}

function buildDetailJsonShape(
  languageName: string,
  nativeLanguageName: string,
  naturalHint: string,
  includeGrowthNote: boolean
) {
  return `{
  "sentences": [
    {
      "original": "one learner sentence exactly as spoken/written",
      "fixed": "corrected sentence in ${languageName}, or same as original if already good",
      "comment": "reaction in ${nativeLanguageName}: correction, advice, or praise"
    }
  ],
  "natural": [
    {
      "text": "${naturalHint}",
      "translationJa": "natural ${nativeLanguageName} translation of example 1"
    },
    {
      "text": "A second alternative natural example in ${languageName}. Different wording or angle from the first, same quality. 80-140 words, spoken style.",
      "translationJa": "natural ${nativeLanguageName} translation of example 2"
    }
  ],${
    includeGrowthNote
      ? `
  "growthNote": "1-2 sentences in ${nativeLanguageName} comparing THIS attempt to the learner's PREVIOUS attempt on the same question. Mention concrete improvements (e.g. more examples, better connectors) or what still needs work.",`
      : ""
  }
  "vocabulary": [
    { "term": "useful word or phrase in ${languageName}", "note": "short ${nativeLanguageName} explanation" }
  ]
}`;
}

function buildStructuredDetailJsonShape(
  languageName: string,
  nativeLanguageName: string,
  naturalHint: string,
  sections: ReadonlyArray<{ key: string; labelJa: string }>,
  includeGrowthNote: boolean
) {
  const sectionLines = sections
    .map(
      (section) =>
        `        { "key": "${section.key}", "labelJa": "${section.labelJa}", "text": "this part in ${languageName}" }`
    )
    .join(",\n");

  const naturalEntry = `{
      "text": "${naturalHint}",
      "translationJa": "natural ${nativeLanguageName} translation of the full example",
      "sections": [
${sectionLines}
      ]
    }`;

  return `{
  "sentences": [
    {
      "original": "one learner sentence exactly as spoken/written",
      "fixed": "corrected sentence in ${languageName}, or same as original if already good",
      "comment": "reaction in ${nativeLanguageName}: correction, advice, or praise"
    }
  ],
  "natural": [
    ${naturalEntry},
    {
      "text": "A second alternative example in ${languageName}. Same structure quality, different wording.",
      "translationJa": "natural ${nativeLanguageName} translation of example 2",
      "sections": [
${sectionLines}
      ]
    }
  ],${
    includeGrowthNote
      ? `
  "growthNote": "1-2 sentences in ${nativeLanguageName} comparing THIS attempt to the learner's PREVIOUS attempt on the same question. Mention concrete improvements (e.g. more examples, better connectors) or what still needs work.",`
      : ""
  }
  "vocabulary": [
    { "term": "useful word or phrase in ${languageName}", "note": "short ${nativeLanguageName} explanation" }
  ]
}`;
}

const QUICK_PHASE_RULES = `Quick assessment only:
- Do NOT analyze individual sentences yet.
- Do NOT provide natural examples or vocabulary.
- Focus on overall impression, task fit, and encouraging next steps.`;

const DETAIL_PHASE_RULES = `Detailed feedback only:
- Do NOT assign a grade or write an overall summary (those were already shown to the learner).
- Provide sentence-by-sentence feedback, natural examples, and vocabulary.`;

export function buildFeedbackQuickPrompt(
  patternId: PatternId,
  languageName: string,
  nativeLanguageName: string,
  nativeLanguageId: string,
  userText: string,
  scenario?: FeedbackScenario,
  previousAttempt?: PreviousAttemptContext
): string {
  const intro = buildFeedbackIntro(nativeLanguageName, nativeLanguageId, userText, previousAttempt);

  if (patternId === "story") {
    return `${intro}

The learner saw photos in order (panel 1 → 2 → 3 → 4) and told the story in ${languageName}.

${QUICK_PHASE_RULES}

Return JSON only:
${buildQuickJsonShape(
  nativeLanguageName,
  `2-4 sentences in ${nativeLanguageName} on connectors, tense consistency, and cause-effect logic`
)}

${GRADE_RULES(nativeLanguageName)}`;
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

${QUICK_PHASE_RULES}

Return JSON only:
${buildQuickJsonShape(
  nativeLanguageName,
  `2-4 sentences in ${nativeLanguageName} on comparison structure, vocabulary specificity, and clear reasoning`
)}

${GRADE_RULES(nativeLanguageName)}`;
  }

  if (patternId === "roleplay") {
    const scenarioBlock = scenario
      ? `
Scenario shown to the learner:
- Japanese: ${scenario.promptJa}
- English: ${scenario.promptEn}`
      : "";

    return `${intro}
${scenarioBlock}

The learner did role-play or gave advice about the photo in ${languageName}.

${QUICK_PHASE_RULES}

Return JSON only:
${buildQuickJsonShape(
  nativeLanguageName,
  `2-4 sentences in ${nativeLanguageName} on subjunctive, tone, and situational fit`
)}

${GRADE_RULES(nativeLanguageName)}`;
  }

  if (patternId === "interview") {
    const questionBlock = scenario
      ? `
Interview question shown to the learner:
- Japanese: ${scenario.promptJa}
- English: ${scenario.promptEn}`
      : "";

    return `${intro}
${questionBlock}

The learner answered an interview question in ${languageName} for about one minute.

${QUICK_PHASE_RULES}

Checklist rules:
- Evaluate each checklist item honestly against the learner's answer.
- "good_length" passes if the answer has enough substance for ~60 seconds (roughly 70+ words or 4+ substantive sentences).

Return JSON only:
${buildQuickJsonShape(
  nativeLanguageName,
  `2-4 sentences in ${nativeLanguageName} on answer structure, specificity, and interview tone`,
  INTERVIEW_CHECKLIST
)}

${GRADE_RULES(nativeLanguageName)}`;
  }

  if (patternId === "email") {
    const isReply = scenario?.emailType === "reply";
    const emailBlock = scenario
      ? `
Email task shown to the learner:
- Type: ${isReply ? "Reply to an incoming email" : "Write a new email from scratch"}
- Japanese instruction: ${scenario.promptJa}
- English instruction: ${scenario.promptEn}${
          isReply && scenario.incomingEmailEn
            ? `

Incoming email the learner must reply to:
"""
${scenario.incomingEmailEn}
"""`
            : ""
        }`
      : "";

    return `${intro}
${emailBlock}

The learner wrote an email in ${languageName}.

${QUICK_PHASE_RULES}

Checklist rules:
- Evaluate each checklist item against the learner's email.
- For replies, "answers_all_points" passes only if every request/question in the incoming email is addressed.

Return JSON only:
${buildQuickJsonShape(
  nativeLanguageName,
  `2-4 sentences in ${nativeLanguageName} on email structure, tone, completeness, and expressions`,
  isReply ? EMAIL_REPLY_CHECKLIST : EMAIL_COMPOSE_CHECKLIST
)}

${GRADE_RULES(nativeLanguageName)}`;
  }

  if (patternId === "speculate") {
    return `${intro}

The learner speculated about the photo in ${languageName} (why, before, next).

${QUICK_PHASE_RULES}

Return JSON only:
${buildQuickJsonShape(
  nativeLanguageName,
  `2-4 sentences in ${nativeLanguageName} on modality usage and logical grounding`
)}

${GRADE_RULES(nativeLanguageName)}`;
  }

  return `${intro}

The learner described the photo in ${languageName}.

${QUICK_PHASE_RULES}

Return JSON only:
${buildQuickJsonShape(nativeLanguageName, `2-4 sentences of overall feedback in ${nativeLanguageName}`)}

${GRADE_RULES(nativeLanguageName)}`;
}

export function buildFeedbackDetailPrompt(
  patternId: PatternId,
  languageName: string,
  nativeLanguageName: string,
  nativeLanguageId: string,
  userText: string,
  scenario?: FeedbackScenario,
  previousAttempt?: PreviousAttemptContext
): string {
  const intro = buildFeedbackIntro(nativeLanguageName, nativeLanguageId, userText, previousAttempt);

  if (patternId === "story") {
    return `${intro}

The learner saw photos in order (panel 1 → 2 → 3 → 4) and told the story in ${languageName}. Use the attached images.

${DETAIL_PHASE_RULES}

Return JSON only:
${buildDetailJsonShape(
  languageName,
  nativeLanguageName,
  `A natural 60-second spoken story covering ALL panels in order in ${languageName}. Use First, Then, After that, Eventually, However. 80-160 words, spoken style.`,
  Boolean(previousAttempt)
)}

Focus sentence comments on: connectors, tense, causal links, story gaps.
${SHARED_RULES(nativeLanguageName)}${codeSwitchFeedbackRules(languageName, nativeLanguageName)}`;
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

The learner compared Image A and Image B in ${languageName}. Use the attached images.

${DETAIL_PHASE_RULES}

Return JSON only:
${buildDetailJsonShape(
  languageName,
  nativeLanguageName,
  `A natural 60-second comparison in ${languageName}. Choose A or B clearly. Use On the one hand... On the other hand... Therefore... 80-140 words.`,
  Boolean(previousAttempt)
)}

Focus sentence comments on: comparison phrases, vague words, missing conclusion.
Vocabulary: comparison words and scene-specific terms for both images.
${SHARED_RULES(nativeLanguageName)}${codeSwitchFeedbackRules(languageName, nativeLanguageName)}`;
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

The learner did role-play or gave advice about the photo in ${languageName}. Use the attached image.

${DETAIL_PHASE_RULES}

Return JSON only:
${buildDetailJsonShape(
  languageName,
  nativeLanguageName,
  `A natural 60-second role-play in ${languageName}. Use If I were... / I would... and direct speech. Polite and practical. 80-140 words.`,
  Boolean(previousAttempt)
)}

Focus sentence comments on: subjunctive, direct address, register, realism.
${SHARED_RULES(nativeLanguageName)}${codeSwitchFeedbackRules(languageName, nativeLanguageName)}`;
  }

  if (patternId === "interview") {
    const questionBlock = scenario
      ? `
Interview question shown to the learner:
- Japanese: ${scenario.promptJa}
- English: ${scenario.promptEn}

Evaluate whether the learner answered THIS question with enough detail, structure, and natural spoken ${languageName}.`
      : "";

    return `${intro}
${questionBlock}

The learner answered an interview question in ${languageName}.

${DETAIL_PHASE_RULES}

Return JSON only:
${buildStructuredDetailJsonShape(
  languageName,
  nativeLanguageName,
  `A natural 60-second interview answer in ${languageName}. 80-140 words.`,
  INTERVIEW_SECTIONS,
  Boolean(previousAttempt)
)}

Focus sentence comments on: vague answers, missing examples, weak connectors, off-topic content.
Vocabulary: interview phrases, opinion words, and topic-specific terms the learner could use.
For each "natural" example, split the text into sections (opening, example, reason, closing) with accurate text fragments.
${SHARED_RULES(nativeLanguageName)}${codeSwitchFeedbackRules(languageName, nativeLanguageName)}`;
  }

  if (patternId === "email") {
    const isReply = scenario?.emailType === "reply";
    const emailBlock = scenario
      ? `
Email task shown to the learner:
- Type: ${isReply ? "Reply to an incoming email" : "Write a new email from scratch"}
- Japanese instruction: ${scenario.promptJa}
- English instruction: ${scenario.promptEn}${
          isReply && scenario.incomingEmailEn
            ? `

Incoming email the learner must reply to:
"""
${scenario.incomingEmailEn}
"""`
            : ""
        }

Evaluate whether the learner's email fits THIS task.${
          isReply ? " Every question or request in the incoming email must be answered clearly." : ""
        }`
      : "";

    return `${intro}
${emailBlock}

The learner wrote an email in ${languageName}.

${DETAIL_PHASE_RULES}

Return JSON only:
${buildStructuredDetailJsonShape(
  languageName,
  nativeLanguageName,
  `A complete model email in ${languageName}. 80-200 words.`,
  EMAIL_SECTIONS,
  Boolean(previousAttempt)
)}

Focus sentence comments on: missing subject, weak greeting/closing, unclear purpose, unanswered points (for replies), register mistakes.
Vocabulary: useful email phrases and situation-specific expressions (not generic words).
For each "natural" example, split into sections (subject, greeting, body, closing) with accurate text fragments.
${SHARED_RULES(nativeLanguageName)}${codeSwitchFeedbackRules(languageName, nativeLanguageName)}`;
  }

  if (patternId === "speculate") {
    return `${intro}

The learner speculated about the photo in ${languageName} (why, before, next). Use the attached image.

${DETAIL_PHASE_RULES}

Return JSON only:
${buildDetailJsonShape(
  languageName,
  nativeLanguageName,
  `A natural 60-second speculation in ${languageName}. Use must/might/could with visible evidence. 80-140 words.`,
  Boolean(previousAttempt)
)}

Focus sentence comments on: modal verbs, unsupported leaps.
${SHARED_RULES(nativeLanguageName)}${codeSwitchFeedbackRules(languageName, nativeLanguageName)}`;
  }

  return `${intro}

The learner described the photo in ${languageName}. Use the attached image.

${DETAIL_PHASE_RULES}

Return JSON only:
${buildDetailJsonShape(
  languageName,
  nativeLanguageName,
  `A natural 60-second description of THIS photo in ${languageName}. 80-140 words, spoken style.`,
  Boolean(previousAttempt)
)}

Focus sentence comments on grammar, word choice, and clarity.
${SHARED_RULES(nativeLanguageName)}${codeSwitchFeedbackRules(languageName, nativeLanguageName)}`;
}

export function buildFeedbackPrompt(
  patternId: PatternId,
  languageName: string,
  nativeLanguageName: string,
  nativeLanguageId: string,
  userText: string,
  scenario?: FeedbackScenario,
  previousAttempt?: PreviousAttemptContext
): string {
  const intro = buildFeedbackIntro(nativeLanguageName, nativeLanguageId, userText, previousAttempt);

  if (patternId === "story") {
    return `${intro}

The learner saw photos in order (panel 1 → 2 → 3 → 4) and told the story in ${languageName}.

Return JSON only:
${buildJsonShape(
  languageName,
  nativeLanguageName,
  `A natural 60-second spoken story covering ALL panels in order in ${languageName}. Use First, Then, After that, Eventually, However. 80-160 words, spoken style.`,
  `2-4 sentences in ${nativeLanguageName} on connectors, tense consistency, and cause-effect logic`
)}

Focus sentence comments on: connectors, tense, causal links, story gaps.
${sharedRules(languageName, nativeLanguageName)}`;
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
  nativeLanguageName,
  `A natural 60-second comparison in ${languageName}. Choose A or B clearly. Use On the one hand... On the other hand... Therefore... 80-140 words.`,
  `2-4 sentences in ${nativeLanguageName} on comparison structure, vocabulary specificity, and clear reasoning`
)}

Focus sentence comments on: comparison phrases, vague words, missing conclusion.
Vocabulary: comparison words and scene-specific terms for both images.
${sharedRules(languageName, nativeLanguageName)}`;
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
  nativeLanguageName,
  `A natural 60-second role-play in ${languageName}. Use If I were... / I would... and direct speech. Polite and practical. 80-140 words.`,
  `2-4 sentences in ${nativeLanguageName} on subjunctive, tone, and situational fit`
)}

Focus sentence comments on: subjunctive, direct address, register, realism.
${sharedRules(languageName, nativeLanguageName)}`;
  }

  if (patternId === "interview") {
    const questionBlock = scenario
      ? `
Interview question shown to the learner:
- Japanese: ${scenario.promptJa}
- English: ${scenario.promptEn}

Evaluate whether the learner answered THIS question with enough detail, structure, and natural spoken ${languageName}.`
      : "";

    return `${intro}
${questionBlock}

The learner answered an interview question in ${languageName} for about one minute.

Checklist rules:
- Evaluate each checklist item honestly against the learner's answer.
- "good_length" passes if the answer has enough substance for ~60 seconds (roughly 70+ words or 4+ substantive sentences).

Return JSON only:
${buildStructuredJsonShape(
  languageName,
  nativeLanguageName,
  `A natural 60-second interview answer in ${languageName}. 80-140 words.`,
  `2-4 sentences in ${nativeLanguageName} on answer structure, specificity, and interview tone`,
  INTERVIEW_CHECKLIST,
  INTERVIEW_SECTIONS,
  Boolean(previousAttempt)
)}

Focus sentence comments on: vague answers, missing examples, weak connectors, off-topic content.
Vocabulary: interview phrases, opinion words, and topic-specific terms the learner could use.
For each "natural" example, split the text into sections (opening, example, reason, closing) with accurate text fragments.
${sharedRules(languageName, nativeLanguageName)}`;
  }

  if (patternId === "email") {
    const isReply = scenario?.emailType === "reply";
    const emailBlock = scenario
      ? `
Email task shown to the learner:
- Type: ${isReply ? "Reply to an incoming email" : "Write a new email from scratch"}
- Japanese instruction: ${scenario.promptJa}
- English instruction: ${scenario.promptEn}${
          isReply && scenario.incomingEmailEn
            ? `

Incoming email the learner must reply to:
"""
${scenario.incomingEmailEn}
"""`
            : ""
        }

Evaluate whether the learner's email fits THIS task. Check subject line (if included), greeting, purpose, body structure, tone/register, and closing.${
          isReply ? " Every question or request in the incoming email must be answered clearly." : ""
        }`
      : "";

    return `${intro}
${emailBlock}

The learner wrote an email in ${languageName}.

Checklist rules:
- Evaluate each checklist item against the learner's email.
- For replies, "answers_all_points" passes only if every request/question in the incoming email is addressed.

Return JSON only:
${buildStructuredJsonShape(
  languageName,
  nativeLanguageName,
  `A complete model email in ${languageName}. 80-200 words.`,
  `2-4 sentences in ${nativeLanguageName} on email structure, tone, completeness, and expressions`,
  isReply ? EMAIL_REPLY_CHECKLIST : EMAIL_COMPOSE_CHECKLIST,
  EMAIL_SECTIONS,
  Boolean(previousAttempt)
)}

Focus sentence comments on: missing subject, weak greeting/closing, unclear purpose, unanswered points (for replies), register mistakes.
Vocabulary: useful email phrases and situation-specific expressions (not generic words).
For each "natural" example, split into sections (subject, greeting, body, closing) with accurate text fragments.
${sharedRules(languageName, nativeLanguageName)}`;
  }

  if (patternId === "speculate") {
    return `${intro}

The learner speculated about the photo in ${languageName} (why, before, next).

Return JSON only:
${buildJsonShape(
  languageName,
  nativeLanguageName,
  `A natural 60-second speculation in ${languageName}. Use must/might/could with visible evidence. 80-140 words.`,
  `2-4 sentences in ${nativeLanguageName} on modality usage and logical grounding`
)}

Focus sentence comments on: modal verbs, unsupported leaps.
${sharedRules(languageName, nativeLanguageName)}`;
  }

  return `${intro}

The learner described the photo in ${languageName}.

Return JSON only:
${buildJsonShape(
  languageName,
  nativeLanguageName,
  `A natural 60-second description of THIS photo in ${languageName}. 80-140 words, spoken style.`,
  `2-4 sentences of overall feedback in ${nativeLanguageName}`
)}

Focus sentence comments on grammar, word choice, and clarity.
${sharedRules(languageName, nativeLanguageName)}`;
}
