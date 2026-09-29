import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { getPatternImageDir, isImageFile } from "@/lib/images";

export async function listDescribeSceneTargets(limit = 20): Promise<string[]> {
  const dir = getPatternImageDir("describe");
  const files = (await readdir(dir)).filter(isImageFile).sort();
  return files.slice(0, limit).map((file) => `/images/describe/${file}`);
}

export async function listSpeculateSceneTargets(limit = 5): Promise<string[]> {
  const dir = getPatternImageDir("speculate");
  const files = (await readdir(dir)).filter(isImageFile).sort();
  return files.slice(0, limit).map((file) => `/images/speculate/${file}`);
}

export async function listRoleplaySceneTargets(limit = 5): Promise<string[]> {
  const baseDir = getPatternImageDir("roleplay");
  const entries = await readdir(baseDir);
  const paths: string[] = [];

  for (const entry of entries.sort()) {
    const entryPath = path.join(baseDir, entry);
    const info = await stat(entryPath).catch(() => null);
    if (!info?.isDirectory() || entry.startsWith("_")) continue;
    const files = (await readdir(entryPath)).filter(isImageFile).sort();
    for (const file of files) {
      paths.push(`/images/roleplay/${entry}/${file}`);
    }
  }

  return paths.sort((a, b) => a.localeCompare(b)).slice(0, limit);
}

export async function listAllSceneDescriptionTargets() {
  const [describe, speculate, roleplay] = await Promise.all([
    listDescribeSceneTargets(20),
    listSpeculateSceneTargets(5),
    listRoleplaySceneTargets(5),
  ]);
  return { describe, speculate, roleplay, all: [...describe, ...speculate, ...roleplay] };
}
