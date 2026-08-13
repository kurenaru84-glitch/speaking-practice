import { readdir } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getPattern } from "@/lib/patterns";
import { getPatternImageDir } from "@/lib/images";

const EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pattern = getPattern(searchParams.get("pattern") ?? "describe");

  try {
    const dir = getPatternImageDir(pattern.imageFolder);
    const files = await readdir(dir);
    const images = files
      .filter((file) => EXTENSIONS.has(path.extname(file).toLowerCase()))
      .sort((a, b) => a.localeCompare(b))
      .map((file) => `/images/${pattern.imageFolder}/${file}`);

    return NextResponse.json({ images, pattern: pattern.id });
  } catch {
    return NextResponse.json({ images: [], pattern: pattern.id });
  }
}
