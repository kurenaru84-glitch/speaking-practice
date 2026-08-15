import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getPatternImageDir, isImageFile } from "@/lib/images";
import { getPattern } from "@/lib/patterns";
import { listCompareSets } from "@/lib/compare";
import { listInterviewQuestions } from "@/lib/interview";
import { listRoleplayScenarios } from "@/lib/roleplay";
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

    if (pattern.imageLayout === "roleplay") {
      const roleplayScenarios = await listRoleplayScenarios();
      return NextResponse.json({ roleplayScenarios, pattern: pattern.id });
    }

    if (pattern.imageLayout === "interview") {
      const interviewQuestions = await listInterviewQuestions();
      return NextResponse.json({ interviewQuestions, pattern: pattern.id });
    }

    if (pattern.imageLayout === "compare") {
      const compareSets = await listCompareSets();
      return NextResponse.json({ compareSets, pattern: pattern.id });
    }

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
    if (pattern.imageLayout === "roleplay") {
      return NextResponse.json({ roleplayScenarios: [], pattern: pattern.id });
    }
    if (pattern.imageLayout === "interview") {
      return NextResponse.json({ interviewQuestions: [], pattern: pattern.id });
    }
    if (pattern.imageLayout === "compare") {
      return NextResponse.json({ compareSets: [], pattern: pattern.id });
    }
    return NextResponse.json(
      pattern.multiImage ? { stories: [], pattern: pattern.id } : { images: [], pattern: pattern.id }
    );
  }
}
