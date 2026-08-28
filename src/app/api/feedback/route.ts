import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import {
  getSpeakingFeedback,
  getSpeakingFeedbackDetail,
  getSpeakingFeedbackQuick,
  hasDetailContent,
  hasQuickContent,
} from "@/lib/gemini";
import { getLearningLanguage, getNativeLanguage } from "@/lib/languages";
import { parseImageUrl, parseSetImageUrls } from "@/lib/images";
import { getPattern, type PatternId } from "@/lib/patterns";
import type { FeedbackDetailResult, FeedbackQuickResult, FeedbackResult } from "@/lib/types";
import { getTextCharLimit, textLimitMessage } from "@/lib/text-limits";

type FeedbackRequestBody = {
  phase?: "quick" | "detail";
  image?: string;
  images?: string[];
  text?: string;
  language?: string;
  nativeLanguage?: string;
  pattern?: string;
  scenarioPromptJa?: string;
  scenarioPromptEn?: string;
  compareLabelA?: string;
  compareLabelB?: string;
  emailType?: "compose" | "reply";
  incomingEmailJa?: string;
  incomingEmailEn?: string;
  previousUserText?: string;
  previousChecklistSummary?: string;
};

type SharedFeedbackParams = {
  userText: string;
  languageName: string;
  nativeLanguageName: string;
  nativeLanguageId: string;
  patternId: PatternId;
  scenario?: ReturnType<typeof buildScenario>;
  previousAttempt?: ReturnType<typeof buildPreviousAttempt>;
};

type ImageInput = { base64: string; mimeType: string };

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildScenario(body: FeedbackRequestBody) {
  if (!body.scenarioPromptJa?.trim()) return undefined;
  return {
    promptJa: body.scenarioPromptJa.trim(),
    promptEn: body.scenarioPromptEn?.trim() ?? "",
    labelA: body.compareLabelA?.trim(),
    labelB: body.compareLabelB?.trim(),
    emailType: body.emailType,
    incomingEmailJa: body.incomingEmailJa?.trim(),
    incomingEmailEn: body.incomingEmailEn?.trim(),
  };
}

function buildPreviousAttempt(body: FeedbackRequestBody) {
  if (!body.previousUserText?.trim()) return undefined;
  return {
    userText: body.previousUserText.trim(),
    checklistSummary: body.previousChecklistSummary?.trim(),
  };
}

async function loadImageInputs(
  pattern: ReturnType<typeof getPattern>,
  body: FeedbackRequestBody
): Promise<ImageInput[]> {
  if (pattern.imageLayout === "interview" || pattern.imageLayout === "email") {
    return [];
  }

  if (pattern.multiImage) {
    const urls = body.images ?? [];
    if (urls.length === 0) {
      throw new Error("画像セットがありません。");
    }
    const parsed = parseSetImageUrls(urls, pattern.imageFolder);
    return Promise.all(
      parsed.map(async (item) => ({
        base64: (await readFile(item.fullPath)).toString("base64"),
        mimeType: item.mimeType,
      }))
    );
  }

  const parsed = parseImageUrl(body.image ?? "", pattern.imageFolder);
  const buffer = await readFile(parsed.fullPath);
  return [{ base64: buffer.toString("base64"), mimeType: parsed.mimeType }];
}

async function loadImageInputsSafe(
  pattern: ReturnType<typeof getPattern>,
  body: FeedbackRequestBody
): Promise<ImageInput[]> {
  try {
    return await loadImageInputs(pattern, body);
  } catch {
    return [];
  }
}

function toDetailResult(full: FeedbackResult): FeedbackDetailResult {
  return {
    sentences: full.sentences,
    natural: full.natural,
    vocabulary: full.vocabulary,
    growthNote: full.growthNote,
  };
}

async function fetchFullFeedback(
  sharedParams: SharedFeedbackParams,
  imageInputs: ImageInput[]
): Promise<FeedbackResult | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await getSpeakingFeedback({
        ...sharedParams,
        images: imageInputs,
      });
    } catch {
      if (attempt < 2) await sleep(500 * (attempt + 1));
    }
  }
  return null;
}

async function fetchQuickFeedback(
  sharedParams: SharedFeedbackParams,
  body: FeedbackRequestBody,
  pattern: ReturnType<typeof getPattern>
): Promise<(FeedbackQuickResult & Partial<FeedbackDetailResult>) & { complete?: boolean }> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const feedback = await getSpeakingFeedbackQuick(sharedParams);
      if (hasQuickContent(feedback)) {
        return feedback;
      }
    } catch {
      if (attempt < 2) await sleep(400 * (attempt + 1));
    }
  }

  const imageInputs = await loadImageInputsSafe(pattern, body);
  const full = await fetchFullFeedback(sharedParams, imageInputs);
  if (!full) {
    return {
      summary: "",
      sentences: [],
      natural: [],
      vocabulary: [],
    };
  }

  return {
    summary: full.summary,
    checklist: full.checklist,
    grade: full.grade,
    gradeNote: full.gradeNote,
    sentences: full.sentences,
    natural: full.natural,
    vocabulary: full.vocabulary,
    growthNote: full.growthNote,
    complete: true,
  };
}

async function fetchDetailFeedback(
  sharedParams: SharedFeedbackParams,
  imageInputs: ImageInput[]
): Promise<FeedbackDetailResult> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const feedback = await getSpeakingFeedbackDetail({
        ...sharedParams,
        images: imageInputs,
      });
      if (hasDetailContent(feedback)) {
        return feedback;
      }
    } catch {
      if (attempt < 2) await sleep(400 * (attempt + 1));
    }
  }

  const full = await fetchFullFeedback(sharedParams, imageInputs);
  return full ? toDetailResult(full) : { sentences: [], natural: [], vocabulary: [] };
}

export async function POST(request: Request) {
  const body = (await request.json()) as FeedbackRequestBody;
  const phase = body.phase === "detail" ? "detail" : "quick";

  const text = body.text?.trim() ?? "";
  if (!text) {
    return NextResponse.json({ error: "説明テキストが空です。" }, { status: 400 });
  }

  const pattern = getPattern(body.pattern ?? "describe");
  const charLimit = getTextCharLimit({ patternId: pattern.id as PatternId });
  if (text.length > charLimit) {
    return NextResponse.json({ error: textLimitMessage(charLimit) }, { status: 400 });
  }

  const learning = getLearningLanguage(body.language ?? "en-US");
  const native = getNativeLanguage(body.nativeLanguage ?? "ja-JP");
  const scenario = buildScenario(body);
  const previousAttempt = buildPreviousAttempt(body);

  const sharedParams: SharedFeedbackParams = {
    userText: text,
    languageName: learning.promptName,
    nativeLanguageName: native.promptName,
    nativeLanguageId: native.id,
    patternId: pattern.id as PatternId,
    scenario,
    previousAttempt,
  };

  if (phase === "quick") {
    const feedback = await fetchQuickFeedback(sharedParams, body, pattern);
    return NextResponse.json(feedback);
  }

  const imageInputs = await loadImageInputsSafe(pattern, body);
  const feedback = await fetchDetailFeedback(sharedParams, imageInputs);
  return NextResponse.json(feedback);
}
