import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { getLearningLanguage, getNativeLanguage } from "@/lib/languages";
import { getSpeakingFeedback } from "@/lib/gemini";
import { parseImageUrl, parseSetImageUrls } from "@/lib/images";
import { getPattern, type PatternId } from "@/lib/patterns";

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
  };

  const text = body.text?.trim() ?? "";
  if (!text) {
    return NextResponse.json({ error: "説明テキストが空です。" }, { status: 400 });
  }

  const pattern = getPattern(body.pattern ?? "describe");
  const learning = getLearningLanguage(body.language ?? "en-US");
  const native = getNativeLanguage(body.nativeLanguage ?? "ja-JP");

  let imageInputs: Array<{ base64: string; mimeType: string }>;

  try {
    if (pattern.multiImage) {
      const urls = body.images ?? [];
      if (urls.length === 0) {
        return NextResponse.json({ error: "画像セットがありません。" }, { status: 400 });
      }
      const parsed = parseSetImageUrls(urls, pattern.imageFolder);
      imageInputs = await Promise.all(
        parsed.map(async (item) => ({
          base64: (await readFile(item.fullPath)).toString("base64"),
          mimeType: item.mimeType,
        }))
      );
    } else {
      const parsed = parseImageUrl(body.image ?? "", pattern.imageFolder);
      const buffer = await readFile(parsed.fullPath);
      imageInputs = [{ base64: buffer.toString("base64"), mimeType: parsed.mimeType }];
    }
  } catch {
    return NextResponse.json({ error: "画像が見つかりません。" }, { status: 404 });
  }

  try {
    const feedback = await getSpeakingFeedback({
      images: imageInputs,
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
            }
          : undefined,
    });
    return NextResponse.json(feedback);
  } catch (error) {
    const message = error instanceof Error ? error.message : "フィードバックに失敗しました。";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
