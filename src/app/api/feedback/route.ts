import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getLanguage } from "@/lib/languages";
import { getSpeakingFeedback } from "@/lib/gemini";

const IMAGE_DIR = path.join(process.cwd(), "public", "images");

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export async function POST(request: Request) {
  const body = (await request.json()) as {
    image?: string;
    text?: string;
    language?: string;
  };

  const text = body.text?.trim() ?? "";
  if (!text) {
    return NextResponse.json({ error: "説明テキストが空です。" }, { status: 400 });
  }

  const filename = path.basename(body.image ?? "");
  const imagePath = path.join(IMAGE_DIR, filename);
  if (!imagePath.startsWith(IMAGE_DIR) || !filename) {
    return NextResponse.json({ error: "画像が不正です。" }, { status: 400 });
  }

  let buffer: Buffer;
  try {
    buffer = await readFile(imagePath);
  } catch {
    return NextResponse.json({ error: "画像が見つかりません。" }, { status: 404 });
  }

  const mimeType = MIME[path.extname(filename).toLowerCase()] ?? "image/jpeg";
  const language = getLanguage(body.language ?? "en-US");

  try {
    const feedback = await getSpeakingFeedback({
      imageBase64: buffer.toString("base64"),
      mimeType,
      userText: text,
      languageName: language.promptName,
    });
    return NextResponse.json(feedback);
  } catch (error) {
    const message = error instanceof Error ? error.message : "フィードバックに失敗しました。";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
