import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getPatternImageDir, isImageFile } from "@/lib/images";
import { getPattern } from "@/lib/patterns";
import type { StorySet } from "@/lib/types";

async function listImageSets(baseDir: string, patternFolder: string): Promise<StorySet[]> {
  let entries: string[];
  try {
    entries = await readdir(baseDir);
  } catch {
    return [];
  }

  const sets: StorySet[] = [];
  for (const entry of entries) {
    const setDir = path.join(baseDir, entry);
    const info = await stat(setDir).catch(() => null);
    if (!info?.isDirectory()) continue;

    const files = await readdir(setDir);
    const images = files
      .filter(isImageFile)
      .sort((a, b) => a.localeCompare(b))
      .map((file) => `/images/${patternFolder}/${entry}/${file}`);

    if (images.length > 0) {
      sets.push({ id: entry, title: entry, images });
    }
  }

  return sets.sort((a, b) => a.id.localeCompare(b.id));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pattern = getPattern(searchParams.get("pattern") ?? "describe");

  try {
    const dir = getPatternImageDir(pattern.imageFolder);

    if (pattern.multiImage) {
      const stories = await listImageSets(dir, pattern.imageFolder);
      return NextResponse.json({ stories, pattern: pattern.id });
    }

    const files = await readdir(dir);
    const images = files
      .filter(isImageFile)
      .sort((a, b) => a.localeCompare(b))
      .map((file) => `/images/${pattern.imageFolder}/${file}`);

    return NextResponse.json({ images, pattern: pattern.id });
  } catch {
    return NextResponse.json(
      pattern.multiImage ? { stories: [], pattern: pattern.id } : { images: [], pattern: pattern.id }
    );
  }
}
