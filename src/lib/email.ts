import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { getEmailContext } from "@/lib/email-context";
import { getPatternImageDir } from "@/lib/images";
import type { EmailCategoryMeta, EmailScenario } from "@/lib/email-meta";

const META_FILENAME = "meta.json";

async function readCategoryMeta(categoryDir: string): Promise<EmailCategoryMeta | null> {
  try {
    const raw = await readFile(path.join(categoryDir, META_FILENAME), "utf8");
    const parsed = JSON.parse(raw) as Partial<EmailCategoryMeta>;
    if (!parsed.categoryJa || !Array.isArray(parsed.scenarios)) return null;
    return {
      categoryJa: parsed.categoryJa,
      categoryEn: parsed.categoryEn ?? parsed.categoryJa,
      scenarios: parsed.scenarios.filter(
        (s) => s.id && s.type && s.promptJa && s.promptEn
      ) as EmailCategoryMeta["scenarios"],
    };
  } catch {
    return null;
  }
}

export async function listEmailScenarios(): Promise<EmailScenario[]> {
  const baseDir = getPatternImageDir("email");
  let entries: string[];
  try {
    entries = await readdir(baseDir);
  } catch {
    return [];
  }

  const scenarios: EmailScenario[] = [];

  for (const entry of entries) {
    const categoryDir = path.join(baseDir, entry);
    const info = await stat(categoryDir).catch(() => null);
    if (!info?.isDirectory() || entry.startsWith("_")) continue;

    const meta = await readCategoryMeta(categoryDir);
    if (!meta) continue;

    for (const s of meta.scenarios) {
      const id = `${entry}/${s.id}`;
      scenarios.push({
        id,
        categoryId: entry,
        categoryJa: meta.categoryJa,
        categoryEn: meta.categoryEn,
        type: s.type,
        context: getEmailContext(id),
        titleJa: s.titleJa ?? s.id,
        promptJa: s.promptJa,
        promptEn: s.promptEn,
        incomingEmailJa: s.incomingEmailJa,
        incomingEmailEn: s.incomingEmailEn,
      });
    }
  }

  return scenarios.sort((a, b) => a.id.localeCompare(b.id));
}
