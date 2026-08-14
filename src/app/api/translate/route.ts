import { NextResponse } from "next/server";
import { getLanguage } from "@/lib/languages";
import { translateToJapanese } from "@/lib/gemini";

export async function POST(request: Request) {
  const body = (await request.json()) as { text?: string; language?: string };
  const text = body.text?.trim() ?? "";
  if (!text) {
    return NextResponse.json({ error: "翻訳するテキストが空です。" }, { status: 400 });
  }
  if (text.length > 300) {
    return NextResponse.json({ error: "翻訳は300文字以内にしてください。" }, { status: 400 });
  }

  const language = getLanguage(body.language ?? "en-US");

  try {
    const translationJa = await translateToJapanese({
      text,
      languageName: language.promptName,
    });
    return NextResponse.json({ translationJa });
  } catch (error) {
    const message = error instanceof Error ? error.message : "翻訳に失敗しました。";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
