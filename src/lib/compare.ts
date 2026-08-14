import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { getPatternImageDir, isImageFile } from "@/lib/images";
import { defaultCompareMeta, type CompareMeta } from "@/lib/compare-meta";
import type { CompareSet } from "@/lib/types";

const META_FILENAME = "meta.json";

async function readSetMeta(setDir: string, setId: string): Promise<CompareMeta> {
  const defaults = defaultCompareMeta(setId);
  try {
    const raw = await readFile(path.join(setDir, META_FILENAME), "utf8");
    const parsed = JSON.parse(raw) as Partial<CompareMeta>;
    return {
      titleJa: parsed.titleJa ?? defaults.titleJa,
      titleEn: parsed.titleEn ?? defaults.titleEn,
      labelA: parsed.labelA ?? defaults.labelA,
      labelB: parsed.labelB ?? defaults.labelB,
      promptJa: parsed.promptJa ?? defaults.promptJa,
      promptEn: parsed.promptEn ?? defaults.promptEn,
    };
  } catch {
    return defaults;
  }
}

function pickAbImages(files: string[], setId: string): string[] {
  const images = files.filter(isImageFile);
  const a = images.find((f) => /^a\./i.test(f));
  const b = images.find((f) => /^b\./i.test(f));
  if (a && b) {
    return [`/images/compare/${setId}/${a}`, `/images/compare/${setId}/${b}`];
  }
  return images
    .sort((x, y) => x.localeCompare(y))
    .slice(0, 2)
    .map((file) => `/images/compare/${setId}/${file}`);
}

export async function listCompareSets(): Promise<CompareSet[]> {
  const baseDir = getPatternImageDir("compare");
  let entries: string[];
  try {
    entries = await readdir(baseDir);
  } catch {
    return [];
  }

  const sets: CompareSet[] = [];
  for (const entry of entries) {
    const setDir = path.join(baseDir, entry);
    const info = await stat(setDir).catch(() => null);
    if (!info?.isDirectory() || entry.startsWith("_")) continue;

    const files = await readdir(setDir);
    const images = pickAbImages(files, entry);
    if (images.length < 2) continue;

    const meta = await readSetMeta(setDir, entry);
    sets.push({
      id: entry,
      title: meta.titleJa,
      titleJa: meta.titleJa,
      titleEn: meta.titleEn ?? meta.titleJa,
      labelA: meta.labelA,
      labelB: meta.labelB,
      promptJa: meta.promptJa,
      promptEn: meta.promptEn ?? meta.promptJa,
      images,
    });
  }

  return sets.sort((a, b) => a.id.localeCompare(b.id));
}
