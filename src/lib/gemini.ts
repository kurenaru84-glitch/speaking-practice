import type { FeedbackResult } from "@/lib/types";

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
  imageBase64: string;
  mimeType: string;
  userText: string;
  languageName: string;
}): Promise<FeedbackResult> {
  const prompt = `You are a kind language tutor. The learner described the attached photo in ${params.languageName} for about 1 minute.

Learner text:
"""
${params.userText}
"""

Return JSON only, with this shape:
{
  "corrections": [{ "original": "exact phrase from the learner", "fixed": "corrected phrase", "note": "short explanation in Japanese" }],
  "natural": "a natural 60-second spoken description of THIS photo in ${params.languageName}. Write as spoken language, 80-140 words.",
  "summary": "2-4 sentences of overall feedback in Japanese"
}

Rules:
- If the text is already good, corrections may be an empty array.
- natural must describe the actual photo, not a generic scene.
- Keep notes and summary in Japanese.
- Do not wrap the JSON in markdown.`;

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

  try {
    return JSON.parse(text) as FeedbackResult;
  } catch {
    throw new Error("AIの応答を解析できませんでした。もう一度お試しください。");
  }
}
