import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { getLanguage } from "@/lib/languages";
import { getSpeakingFeedback } from "@/lib/gemini";
import { parseImageUrl } from "@/lib/images";
import { getPattern, type PatternId } from "@/lib/patterns";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    image?: string;
    text?: string;
    language?: string;
    pattern?: string;
  };

  const text = body.text?.trim() ?? "";
  if (!text) {
    return NextResponse.json({ error: "説明テキストが空です。" }, { status: 400 });
  }

  const pattern = getPattern(body.pattern ?? "describe");

  let imagePath: string;
  let mimeType: string;
  try {
    const parsed = parseImageUrl(body.image ?? "", pattern.imageFolder);
    imagePath = parsed.fullPath;
    mimeType = parsed.mimeType;
  } catch {
    return NextResponse.json({ error: "画像が不正です。" }, { status: 400 });
  }

  let buffer: Buffer;
  try {
    buffer = await readFile(imagePath);
  } catch {
    return NextResponse.json({ error: "画像が見つかりません。" }, { status: 404 });
  }

  const language = getLanguage(body.language ?? "en-US");

  try {
    const feedback = await getSpeakingFeedback({
      imageBase64: buffer.toString("base64"),
      mimeType,
      userText: text,
      languageName: language.promptName,
      patternId: pattern.id as PatternId,
    });
    return NextResponse.json(feedback);
  } catch (error) {
    const message = error instanceof Error ? error.message : "フィードバックに失敗しました。";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
