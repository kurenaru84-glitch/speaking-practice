import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { getPatternImageDir, isImageFile } from "@/lib/images";
import {
  defaultCategoryLabels,
  defaultRoleplayPrompt,
  type RoleplayMeta,
  type RoleplayScenario,
} from "@/lib/roleplay-meta";

const META_FILENAME = "meta.json";

async function readCategoryMeta(categoryDir: string, categoryId: string): Promise<RoleplayMeta> {
  const defaults = defaultCategoryLabels(categoryId);
  try {
    const raw = await readFile(path.join(categoryDir, META_FILENAME), "utf8");
    const parsed = JSON.parse(raw) as Partial<RoleplayMeta>;
    return {
      categoryJa: parsed.categoryJa ?? defaults.ja,
      categoryEn: parsed.categoryEn ?? defaults.en,
      images: Array.isArray(parsed.images) ? parsed.images : [],
    };
  } catch {
    return {
      categoryJa: defaults.ja,
      categoryEn: defaults.en,
      images: [],
    };
  }
}

function buildScenario(
  categoryId: string,
  meta: RoleplayMeta,
  filename: string
): RoleplayScenario {
  const imagePath = `/images/roleplay/${categoryId}/${filename}`;
  const entry = meta.images.find((item) => item.file === filename);
  const fallback = defaultRoleplayPrompt(meta.categoryJa);

  return {
    id: `${categoryId}/${path.parse(filename).name}`,
    categoryId,
    categoryJa: meta.categoryJa,
    categoryEn: meta.categoryEn ?? defaultCategoryLabels(categoryId).en,
    image: imagePath,
    promptJa: entry?.promptJa?.trim() || fallback.promptJa,
    promptEn: entry?.promptEn?.trim() || fallback.promptEn,
  };
}

async function listCategoryScenarios(
  categoryDir: string,
  categoryId: string
): Promise<RoleplayScenario[]> {
  const meta = await readCategoryMeta(categoryDir, categoryId);
  const files = await readdir(categoryDir);
  const images = files.filter(isImageFile).sort((a, b) => a.localeCompare(b));
  return images.map((filename) => buildScenario(categoryId, meta, filename));
}

async function listLegacyScenarios(baseDir: string): Promise<RoleplayScenario[]> {
  const files = await readdir(baseDir);
  const images = files.filter(isImageFile).sort((a, b) => a.localeCompare(b));
  if (images.length === 0) return [];

  const categoryId = "uncategorized";
  const meta = {
    categoryJa: defaultCategoryLabels(categoryId).ja,
    categoryEn: defaultCategoryLabels(categoryId).en,
    images: [] as RoleplayMeta["images"],
  };

  return images.map((filename) => ({
    ...buildScenario(categoryId, meta, filename),
    image: `/images/roleplay/${filename}`,
    id: `uncategorized/${path.parse(filename).name}`,
  }));
}

export async function listRoleplayScenarios(): Promise<RoleplayScenario[]> {
  const baseDir = getPatternImageDir("roleplay");
  let entries: string[];
  try {
    entries = await readdir(baseDir);
  } catch {
    return [];
  }

  const scenarios: RoleplayScenario[] = [];

  for (const entry of entries) {
    const entryPath = path.join(baseDir, entry);
    const info = await stat(entryPath).catch(() => null);
    if (!info?.isDirectory() || entry.startsWith("_")) continue;
    scenarios.push(...(await listCategoryScenarios(entryPath, entry)));
  }

  scenarios.push(...(await listLegacyScenarios(baseDir)));

  return scenarios.sort((a, b) =>
    `${a.categoryId}/${a.image}`.localeCompare(`${b.categoryId}/${b.image}`)
  );
}

export async function loadRoleplayMeta(categoryId: string): Promise<RoleplayMeta> {
  const categoryDir = path.join(getPatternImageDir("roleplay"), categoryId);
  return readCategoryMeta(categoryDir, categoryId);
}

export function getRoleplayMetaPath(categoryId: string) {
  return path.join(getPatternImageDir("roleplay"), categoryId, META_FILENAME);
}
