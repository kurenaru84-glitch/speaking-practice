import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { getPatternImageDir, isImageFile } from "@/lib/images";

export async function listDescribeSceneTargets(limit = 100): Promise<string[]> {
  const dir = getPatternImageDir("describe");
  const files = (await readdir(dir)).filter(isImageFile).sort();
  return files.slice(0, limit).map((file) => `/images/describe/${file}`);
}

export async function listSpeculateSceneTargets(): Promise<string[]> {
  const dir = getPatternImageDir("speculate");
  const files = (await readdir(dir)).filter(isImageFile).sort();
  return files.map((file) => `/images/speculate/${file}`);
}

export async function listRoleplaySceneTargets(): Promise<string[]> {
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

  return paths.sort((a, b) => a.localeCompare(b));
}

export async function listCompareSceneTargets(): Promise<string[]> {
  const baseDir = getPatternImageDir("compare");
  const entries = await readdir(baseDir);
  const paths: string[] = [];

  for (const entry of entries.sort()) {
    const entryPath = path.join(baseDir, entry);
    const info = await stat(entryPath).catch(() => null);
    if (!info?.isDirectory() || entry.startsWith("_")) continue;
    const files = (await readdir(entryPath)).filter(isImageFile).sort();
    for (const file of files) {
      paths.push(`/images/compare/${entry}/${file}`);
    }
  }

  return paths.sort((a, b) => a.localeCompare(b));
}

export async function listAllSceneDescriptionTargets() {
  const [describe, speculate, roleplay, compare] = await Promise.all([
    listDescribeSceneTargets(100),
    listSpeculateSceneTargets(),
    listRoleplaySceneTargets(),
    listCompareSceneTargets(),
  ]);
  return {
    describe,
    speculate,
    roleplay,
    compare,
    all: [...describe, ...speculate, ...roleplay, ...compare],
  };
}
