import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { listCompareSets } from "@/lib/compare";
import { listEmailScenarios } from "@/lib/email";
import { getPatternImageDir, isImageFile } from "@/lib/images";
import type { ImageCatalog } from "@/lib/image-catalog-types";
import { listInterviewQuestions } from "@/lib/interview";
import { listRoleplayScenarios } from "@/lib/roleplay";
import type { StorySet } from "@/lib/types";

export type { ImageCatalog } from "@/lib/image-catalog-types";

async function listFlatImages(folder: string): Promise<string[]> {
  try {
    const files = await readdir(getPatternImageDir(folder));
    return files
      .filter(isImageFile)
      .sort((a, b) => a.localeCompare(b))
      .map((file) => `/images/${folder}/${file}`);
  } catch {
    return [];
  }
}

async function listStorySets(): Promise<StorySet[]> {
  const baseDir = getPatternImageDir("story");
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
      .map((file) => `/images/story/${entry}/${file}`);

    if (images.length > 0) {
      sets.push({ id: entry, title: entry, images });
    }
  }

  return sets.sort((a, b) => a.id.localeCompare(b.id));
}

export async function loadImageCatalog(): Promise<ImageCatalog> {
  const [
    describeImages,
    speculateImages,
    stories,
    compareSets,
    roleplayScenarios,
    interviewQuestions,
    emailScenarios,
  ] = await Promise.all([
    listFlatImages("describe"),
    listFlatImages("speculate"),
    listStorySets(),
    listCompareSets(),
    listRoleplayScenarios(),
    listInterviewQuestions(),
    listEmailScenarios(),
  ]);

  return {
    describeImages,
    speculateImages,
    stories,
    compareSets,
    roleplayScenarios,
    interviewQuestions,
    emailScenarios,
  };
}
