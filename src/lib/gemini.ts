import type { FeedbackResult, NaturalExample } from "@/lib/types";
import { buildFeedbackPrompt, type PatternId } from "@/lib/patterns";

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
  if (!text) throw new Error("Gemini から応答がありませんでした。");
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
    throw new Error(data.error?.message ?? `Gemini API error (${res.status})`);
  }
  return extractText(data);
}

export async function transcribeAudio(params: {
  audioBase64: string;
  mimeType: string;
  languageName: string;
}): Promise<string> {
  const prompt = `Transcribe this spoken audio accurately in ${params.languageName}.
Return only the transcription text.
Do not translate, summarize, or add commentary.
Keep filler words and natural spoken phrasing.`;

  const text = await callGemini({
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
  return text;
}

export async function translateToJapanese(params: {
  text: string;
  languageName: string;
}): Promise<string> {
  const phrase = params.text.trim();
  if (!phrase) throw new Error("翻訳するテキストが空です。");

  const prompt = `Translate the following ${params.languageName} phrase into natural Japanese for a language learner's vocabulary memo.
Use a concise, natural Japanese meaning (not word-for-word if unnatural).
Return only the Japanese translation, with no quotes or explanation.

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

export async function getSpeakingFeedback(params: {
  images: Array<{ base64: string; mimeType: string }>;
  userText: string;
  languageName: string;
  patternId: PatternId;
  scenario?: { promptJa: string; promptEn: string; labelA?: string; labelB?: string };
}): Promise<FeedbackResult> {
  const prompt = buildFeedbackPrompt(
    params.patternId,
    params.languageName,
    params.userText,
    params.scenario
  );

  const imageParts = params.images.map((img) => ({
    inline_data: {
      mime_type: img.mimeType,
      data: img.base64,
    },
  }));

  const text = await callGemini({
    contents: [
      {
        parts: [...imageParts, { text: prompt }],
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
          if (!text) return null;
          return { text, translationJa };
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

function normalizeFeedback(raw: unknown): FeedbackResult {
  const data = raw as Partial<FeedbackResult> & {
    corrections?: Array<{ original: string; fixed: string; note: string }>;
    natural?: string | string[];
  };

  if (Array.isArray(data.sentences) && data.sentences.length > 0) {
    return {
      sentences: data.sentences.map((s) => ({
        original: s.original ?? "",
        fixed: s.fixed ?? s.original ?? "",
        comment: s.comment ?? "",
      })),
      natural: normalizeNatural(data.natural),
      vocabulary: (data.vocabulary ?? []).slice(0, 10),
      summary: data.summary ?? "",
    };
  }

  if (Array.isArray(data.corrections)) {
    return {
      sentences: data.corrections.map((c) => ({
        original: c.original,
        fixed: c.fixed,
        comment: c.note,
      })),
      natural: normalizeNatural(data.natural),
      vocabulary: (data.vocabulary ?? []).slice(0, 10),
      summary: data.summary ?? "",
    };
  }

  throw new Error("AIの応答形式が不正です。");
}
