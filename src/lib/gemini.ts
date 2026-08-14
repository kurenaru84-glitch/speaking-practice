import type { FeedbackResult } from "@/lib/types";
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

export async function getSpeakingFeedback(params: {
  images: Array<{ base64: string; mimeType: string }>;
  userText: string;
  languageName: string;
  patternId: PatternId;
}): Promise<FeedbackResult> {
  const prompt = buildFeedbackPrompt(params.patternId, params.languageName, params.userText);

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

function normalizeNatural(value: unknown): string[] {
  if (Array.isArray(value)) {
    const items = value.map((item) => String(item ?? "").trim()).filter(Boolean);
    if (items.length >= 2) return items.slice(0, 2);
    return items;
  }
  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
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
