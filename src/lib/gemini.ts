import {
  buildTranscribePrompt,
  formatTranscriptLocally,
} from "@/lib/code-switch";
import type {
  ChecklistItem,
  FeedbackDetailResult,
  FeedbackGrade,
  FeedbackQuickResult,
  FeedbackResult,
  NaturalExample,
  NaturalSection,
} from "@/lib/types";
import { filterFeedbackSentences } from "@/lib/skip-feedback-sentences";
import {
  buildFeedbackDetailPrompt,
  buildFeedbackPrompt,
  buildFeedbackQuickPrompt,
  type PatternId,
  type PreviousAttemptContext,
} from "@/lib/patterns";

const MODEL = "gemini-3.6-flash";
const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

type GeminiResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string; thought?: boolean }> };
  }>;
  error?: { message?: string };
};

function getApiKey() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY が .env.local に設定されていません。");
  }
  return apiKey;
}

function extractText(data: GeminiResponse) {
  const text =
    data.candidates?.[0]?.content?.parts
      ?.filter((part) => !part.thought)
      .map((part) => part.text ?? "")
      .join("") ?? "";
  if (!text) throw new Error("AI から応答がありませんでした。");
  return text.trim();
}

async function callGemini(body: Record<string, unknown>) {
  const apiKey = getApiKey();
  const url = `${API_BASE}/${MODEL}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as GeminiResponse;
  if (!res.ok) {
    throw new Error(data.error?.message ?? `AI API error (${res.status})`);
  }
  return extractText(data);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callGeminiWithRetry(body: Record<string, unknown>, attempts = 3) {
  let lastError: Error | undefined;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await callGemini(body);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < attempts - 1) {
        await sleep(400 * (attempt + 1));
      }
    }
  }
  throw lastError ?? new Error("AI API error");
}

function emptyDetailResult(): FeedbackDetailResult {
  return { sentences: [], natural: [], vocabulary: [] };
}

export function hasQuickContent(feedback: FeedbackQuickResult) {
  return Boolean(feedback.summary?.trim() || feedback.grade);
}

export function hasDetailContent(feedback: FeedbackDetailResult) {
  return (
    feedback.sentences.length > 0 ||
    feedback.natural.some((example) => example.text.trim()) ||
    feedback.vocabulary.length > 0
  );
}

export async function transcribeAudio(params: {
  audioBase64: string;
  mimeType: string;
  languageName: string;
  nativeLanguageName: string;
}): Promise<string> {
  const prompt = buildTranscribePrompt(params.languageName, params.nativeLanguageName);

  let text = await callGemini({
    contents: [
      {
        parts: [
          {
            inline_data: {
              mime_type: params.mimeType,
              data: params.audioBase64,
            },
          },
          { text: prompt },
        ],
      },
    ],
    generationConfig: {
      thinkingConfig: { thinkingLevel: "minimal" },
    },
  });

  if (!text) {
    throw new Error("音声を認識できませんでした。もう一度録音してください。");
  }

  text = formatTranscriptLocally(text.trim());

  if (!text.trim()) {
    throw new Error("音声を認識できませんでした。もう一度録音してください。");
  }

  return text.trim();
}

export async function translateToNative(params: {
  text: string;
  languageName: string;
  nativeLanguageName: string;
}): Promise<string> {
  const phrase = params.text.trim();
  if (!phrase) throw new Error("翻訳するテキストが空です。");

  const prompt = `Translate the following ${params.languageName} phrase into natural ${params.nativeLanguageName} for a language learner's vocabulary memo.
Use a concise, natural meaning in ${params.nativeLanguageName} (not word-for-word if unnatural).
Return only the ${params.nativeLanguageName} translation, with no quotes or explanation.

Phrase:
"""
${phrase}
"""`;

  const text = await callGemini({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      thinkingConfig: { thinkingLevel: "minimal" },
    },
  });

  if (!text) throw new Error("翻訳できませんでした。");
  return text.replace(/^["「]|["」]$/g, "").trim();
}

export async function generateRoleplayScenarioPrompt(params: {
  imageBase64: string;
  mimeType: string;
  categoryJa: string;
  categoryEn: string;
}): Promise<{ promptJa: string; promptEn: string }> {
  const prompt = `You are creating role-play speaking practice for language learners.
Category: ${params.categoryJa} (${params.categoryEn})

Look at the photo. Write ONE short scenario question for the learner.
- promptJa: 1-2 sentences in Japanese ending with ？ Example: "同僚が仕事がうまくいかなくて落ち込んでいます。どう声をかけますか？"
- promptEn: same meaning in natural English
The learner should speak DIRECTLY to the person in the photo (not describe the scene).

Return JSON only:
{ "promptJa": "...", "promptEn": "..." }`;

  const text = await callGemini({
    contents: [
      {
        parts: [
          {
            inline_data: {
              mime_type: params.mimeType,
              data: params.imageBase64,
            },
          },
          { text: prompt },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      thinkingConfig: { thinkingLevel: "minimal" },
    },
  });

  const parsed = JSON.parse(text) as { promptJa?: string; promptEn?: string };
  const promptJa = parsed.promptJa?.trim();
  const promptEn = parsed.promptEn?.trim();
  if (!promptJa || !promptEn) {
    throw new Error("プロンプト生成結果が不完全です。");
  }
  return { promptJa, promptEn };
}

export async function getSpeakingFeedbackQuick(params: {
  userText: string;
  languageName: string;
  nativeLanguageName: string;
  nativeLanguageId: string;
  patternId: PatternId;
  scenario?: {
    promptJa: string;
    promptEn: string;
    labelA?: string;
    labelB?: string;
    emailType?: "compose" | "reply";
    incomingEmailJa?: string;
    incomingEmailEn?: string;
  };
  previousAttempt?: PreviousAttemptContext;
}): Promise<FeedbackQuickResult> {
  const prompt = buildFeedbackQuickPrompt(
    params.patternId,
    params.languageName,
    params.nativeLanguageName,
    params.nativeLanguageId,
    params.userText,
    params.scenario,
    params.previousAttempt
  );

  const text = await callGeminiWithRetry({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
      thinkingConfig: { thinkingLevel: "minimal" },
    },
  });

  try {
    const parsed = JSON.parse(text);
    return normalizeQuickFeedback(parsed);
  } catch {
    return { summary: "", checklist: undefined, grade: undefined, gradeNote: undefined };
  }
}

export async function getSpeakingFeedbackDetail(params: {
  images?: Array<{ base64: string; mimeType: string }>;
  userText: string;
  languageName: string;
  nativeLanguageName: string;
  nativeLanguageId: string;
  patternId: PatternId;
  scenario?: {
    promptJa: string;
    promptEn: string;
    labelA?: string;
    labelB?: string;
    emailType?: "compose" | "reply";
    incomingEmailJa?: string;
    incomingEmailEn?: string;
  };
  previousAttempt?: PreviousAttemptContext;
}): Promise<FeedbackDetailResult> {
  const prompt = buildFeedbackDetailPrompt(
    params.patternId,
    params.languageName,
    params.nativeLanguageName,
    params.nativeLanguageId,
    params.userText,
    params.scenario,
    params.previousAttempt
  );

  const imageParts = (params.images ?? []).map((img) => ({
    inline_data: {
      mime_type: img.mimeType,
      data: img.base64,
    },
  }));

  const text = await callGeminiWithRetry({
    contents: [
      {
        parts: imageParts.length > 0 ? [...imageParts, { text: prompt }] : [{ text: prompt }],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      thinkingConfig: { thinkingLevel: "minimal" },
    },
  });

  try {
    return normalizeDetailFeedback(JSON.parse(text));
  } catch {
    return emptyDetailResult();
  }
}

export async function getSpeakingFeedback(params: {
  images?: Array<{ base64: string; mimeType: string }>;
  userText: string;
  languageName: string;
  nativeLanguageName: string;
  nativeLanguageId: string;
  patternId: PatternId;
  scenario?: {
    promptJa: string;
    promptEn: string;
    labelA?: string;
    labelB?: string;
    emailType?: "compose" | "reply";
    incomingEmailJa?: string;
    incomingEmailEn?: string;
  };
  previousAttempt?: PreviousAttemptContext;
}): Promise<FeedbackResult> {
  const prompt = buildFeedbackPrompt(
    params.patternId,
    params.languageName,
    params.nativeLanguageName,
    params.nativeLanguageId,
    params.userText,
    params.scenario,
    params.previousAttempt
  );

  const imageParts = (params.images ?? []).map((img) => ({
    inline_data: {
      mime_type: img.mimeType,
      data: img.base64,
    },
  }));

  const text = await callGemini({
    contents: [
      {
        parts: imageParts.length > 0 ? [...imageParts, { text: prompt }] : [{ text: prompt }],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      thinkingConfig: { thinkingLevel: "minimal" },
    },
  });

  try {
    return normalizeFeedback(JSON.parse(text));
  } catch {
    throw new Error("AIの応答を解析できませんでした。もう一度お試しください。");
  }
}

function normalizeSections(value: unknown): NaturalSection[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const sections = value
    .map((item): NaturalSection | null => {
      if (!item || typeof item !== "object") return null;
      const obj = item as Record<string, unknown>;
      const text = String(obj.text ?? "").trim();
      const key = String(obj.key ?? "").trim();
      const labelJa = String(obj.labelJa ?? obj.label ?? "").trim();
      if (!text || !labelJa) return null;
      return { key: key || labelJa, labelJa, text };
    })
    .filter((item): item is NaturalSection => item !== null);
  return sections.length > 0 ? sections : undefined;
}

function normalizeNatural(value: unknown): NaturalExample[] {
  if (Array.isArray(value)) {
    const items = value
      .map((item): NaturalExample | null => {
        if (typeof item === "string") {
          const text = item.trim();
          return text ? { text, translationJa: "" } : null;
        }
        if (item && typeof item === "object") {
          const obj = item as Record<string, unknown>;
          const text = String(obj.text ?? obj.example ?? "").trim();
          const translationJa = String(
            obj.translationJa ?? obj.translation_ja ?? obj.translation ?? ""
          ).trim();
          const sections = normalizeSections(obj.sections);
          if (!text) return null;
          return { text, translationJa, sections };
        }
        return null;
      })
      .filter((item): item is NaturalExample => item !== null);
    return items.slice(0, 2);
  }
  if (typeof value === "string" && value.trim()) {
    return [{ text: value.trim(), translationJa: "" }];
  }
  return [];
}

function normalizeChecklist(value: unknown): ChecklistItem[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const items = value
    .map((item): ChecklistItem | null => {
      if (!item || typeof item !== "object") return null;
      const obj = item as Record<string, unknown>;
      const id = String(obj.id ?? "").trim();
      const labelJa = String(obj.labelJa ?? obj.label ?? "").trim();
      if (!id || !labelJa) return null;
      const note = String(obj.note ?? "").trim();
      return {
        id,
        labelJa,
        passed: Boolean(obj.passed),
        note: note || undefined,
      };
    })
    .filter((item): item is ChecklistItem => item !== null);
  return items.length > 0 ? items : undefined;
}

const VALID_GRADES = new Set<FeedbackGrade>(["A", "B", "C", "D", "E"]);

function normalizeGrade(value: unknown): FeedbackGrade | undefined {
  const grade = String(value ?? "")
    .trim()
    .toUpperCase();
  return VALID_GRADES.has(grade as FeedbackGrade) ? (grade as FeedbackGrade) : undefined;
}

function normalizeGradeFields(raw: unknown): Pick<FeedbackQuickResult, "grade" | "gradeNote"> {
  const data = raw as Partial<FeedbackQuickResult>;
  const grade = normalizeGrade(data.grade);
  const gradeNote = String(data.gradeNote ?? "").trim() || undefined;
  return {
    grade,
    gradeNote: grade ? gradeNote : undefined,
  };
}

function normalizeQuickFeedback(raw: unknown): FeedbackQuickResult {
  const data = raw as Partial<FeedbackQuickResult>;
  return {
    summary: String(data.summary ?? "").trim(),
    checklist: normalizeChecklist(data.checklist),
    ...normalizeGradeFields(data),
  };
}

function normalizeDetailFeedback(raw: unknown): FeedbackDetailResult {
  const data = raw as Partial<FeedbackDetailResult> & {
    corrections?: Array<{ original: string; fixed: string; note: string }>;
    natural?: string | string[];
  };

  const growthNote = String(data.growthNote ?? "").trim() || undefined;

  const mapSentences = (sentences: FeedbackResult["sentences"]): FeedbackDetailResult => ({
    sentences: filterFeedbackSentences(sentences),
    natural: normalizeNatural(data.natural),
    vocabulary: Array.isArray(data.vocabulary) ? data.vocabulary.slice(0, 10) : [],
    growthNote,
  });

  if (Array.isArray(data.sentences)) {
    return mapSentences(
      data.sentences.map((s) => ({
        original: s.original ?? "",
        fixed: s.fixed ?? s.original ?? "",
        comment: s.comment ?? "",
      }))
    );
  }

  if (Array.isArray(data.corrections)) {
    return mapSentences(
      data.corrections.map((c) => ({
        original: c.original,
        fixed: c.fixed,
        comment: c.note,
      }))
    );
  }

  return {
    sentences: [],
    natural: normalizeNatural(data.natural),
    vocabulary: Array.isArray(data.vocabulary) ? data.vocabulary.slice(0, 10) : [],
    growthNote,
  };
}

function normalizeFeedback(raw: unknown): FeedbackResult {
  const data = raw as Partial<FeedbackResult> & {
    corrections?: Array<{ original: string; fixed: string; note: string }>;
    natural?: string | string[];
    growthNote?: string;
  };

  const growthNote = String(data.growthNote ?? "").trim() || undefined;
  const checklist = normalizeChecklist(data.checklist);
  const grade = normalizeGrade(data.grade);
  const gradeNote = String(data.gradeNote ?? "").trim() || undefined;

  const base = (sentences: FeedbackResult["sentences"]) => ({
    sentences: filterFeedbackSentences(sentences),
    natural: normalizeNatural(data.natural),
    vocabulary: (data.vocabulary ?? []).slice(0, 10),
    summary: data.summary ?? "",
    checklist,
    growthNote,
    grade,
    gradeNote: grade ? gradeNote : undefined,
  });

  if (Array.isArray(data.sentences) && data.sentences.length > 0) {
    return base(
      data.sentences.map((s) => ({
        original: s.original ?? "",
        fixed: s.fixed ?? s.original ?? "",
        comment: s.comment ?? "",
      }))
    );
  }

  if (Array.isArray(data.corrections)) {
    return base(
      data.corrections.map((c) => ({
        original: c.original,
        fixed: c.fixed,
        comment: c.note,
      }))
    );
  }

  throw new Error("AIの応答形式が不正です。");
}
