import { NextResponse } from "next/server";
import { getSpeakingFeedback } from "@/lib/gemini";
import { readImageForFeedback, readImagesForFeedback } from "@/lib/feedback-images";
import { getLearningLanguage, getNativeLanguage } from "@/lib/languages";
import { parseImageUrl, parseSetImageUrls } from "@/lib/images";
import { getSceneDescription } from "@/lib/scene-descriptions";
import { getPattern, type PatternId } from "@/lib/patterns";
import { getTextCharLimit, textLimitMessage } from "@/lib/text-limits";

export async function POST(request: Request) {
  const body = (await request.json()) as {
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

  let imageInputs: Array<{ base64: string; mimeType: string }> = [];
  const singleImageUrl = body.image?.trim() ?? "";
  const sceneDescription = singleImageUrl ? getSceneDescription(singleImageUrl) : undefined;

  try {
    if (pattern.imageLayout === "interview" || pattern.imageLayout === "email") {
      imageInputs = [];
    } else if (sceneDescription) {
      imageInputs = [];
    } else if (pattern.multiImage) {
      const urls = body.images ?? [];
      if (urls.length === 0) {
        return NextResponse.json({ error: "画像セットがありません。" }, { status: 400 });
      }
      const parsed = parseSetImageUrls(urls, pattern.imageFolder);
      const layout = pattern.imageLayout === "compare" ? "horizontal" : "vertical";
      imageInputs = await readImagesForFeedback(
        parsed.map((item) => item.fullPath),
        layout
      );
    } else {
      const parsed = parseImageUrl(body.image ?? "", pattern.imageFolder);
      imageInputs = [await readImageForFeedback(parsed.fullPath)];
    }
  } catch {
    return NextResponse.json({ error: "画像が見つかりません。" }, { status: 404 });
  }

  try {
    const feedback = await getSpeakingFeedback({
      images: imageInputs,
      sceneDescription,
      userText: text,
      languageName: learning.promptName,
      nativeLanguageName: native.promptName,
      nativeLanguageId: native.id,
      patternId: pattern.id as PatternId,
      scenario:
        body.scenarioPromptJa?.trim()
          ? {
              promptJa: body.scenarioPromptJa.trim(),
              promptEn: body.scenarioPromptEn?.trim() ?? "",
              labelA: body.compareLabelA?.trim(),
              labelB: body.compareLabelB?.trim(),
              emailType: body.emailType,
              incomingEmailJa: body.incomingEmailJa?.trim(),
              incomingEmailEn: body.incomingEmailEn?.trim(),
            }
          : undefined,
      previousAttempt:
        body.previousUserText?.trim()
          ? {
              userText: body.previousUserText.trim(),
              checklistSummary: body.previousChecklistSummary?.trim(),
            }
          : undefined,
    });
    return NextResponse.json(feedback);
  } catch (error) {
    const message = error instanceof Error ? error.message : "フィードバックに失敗しました。";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
