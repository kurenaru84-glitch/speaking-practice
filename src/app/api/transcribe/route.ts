import { NextResponse } from "next/server";
import { getLanguage } from "@/lib/languages";
import { transcribeAudio } from "@/lib/gemini";

export async function POST(request: Request) {
  const formData = await request.formData();
  const audio = formData.get("audio");
  const language = String(formData.get("language") ?? "en-US");

  if (!(audio instanceof Blob) || audio.size === 0) {
    return NextResponse.json({ error: "音声データがありません。" }, { status: 400 });
  }

  const buffer = Buffer.from(await audio.arrayBuffer());
  const mimeType = audio.type || "audio/webm";
  const lang = getLanguage(language);

  try {
    const text = await transcribeAudio({
      audioBase64: buffer.toString("base64"),
      mimeType,
      languageName: lang.promptName,
    });
    return NextResponse.json({ text });
  } catch (error) {
    const message = error instanceof Error ? error.message : "文字起こしに失敗しました。";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
