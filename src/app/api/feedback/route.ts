import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { getSpeakingFeedbackDetail, getSpeakingFeedbackQuick } from "@/lib/gemini";
import { getLearningLanguage, getNativeLanguage } from "@/lib/languages";
import { parseImageUrl, parseSetImageUrls } from "@/lib/images";
import { getPattern, type PatternId } from "@/lib/patterns";
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
): Promise<Array<{ base64: string; mimeType: string }>> {
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

  const sharedParams = {
    userText: text,
    languageName: learning.promptName,
    nativeLanguageName: native.promptName,
    nativeLanguageId: native.id,
    patternId: pattern.id as PatternId,
    scenario,
    previousAttempt,
  };

  try {
    if (phase === "quick") {
      const feedback = await getSpeakingFeedbackQuick(sharedParams);
      return NextResponse.json(feedback);
    }

    let imageInputs: Array<{ base64: string; mimeType: string }> = [];
    try {
      imageInputs = await loadImageInputs(pattern, body);
    } catch (error) {
      const message = error instanceof Error ? error.message : "画像が見つかりません。";
      const status = message === "画像セットがありません。" ? 400 : 404;
      return NextResponse.json({ error: message }, { status });
    }

    const feedback = await getSpeakingFeedbackDetail({
      ...sharedParams,
      images: imageInputs,
    });
    return NextResponse.json(feedback);
  } catch (error) {
    const message = error instanceof Error ? error.message : "フィードバックに失敗しました。";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
