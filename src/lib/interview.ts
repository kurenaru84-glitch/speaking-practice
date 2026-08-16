import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { getInterviewContext } from "@/lib/interview-context";
import { getPatternImageDir } from "@/lib/images";
import type { InterviewCategoryMeta, InterviewQuestion } from "@/lib/interview-meta";

const META_FILENAME = "meta.json";

async function readCategoryMeta(categoryDir: string): Promise<InterviewCategoryMeta | null> {
  try {
    const raw = await readFile(path.join(categoryDir, META_FILENAME), "utf8");
    const parsed = JSON.parse(raw) as Partial<InterviewCategoryMeta>;
    if (!parsed.categoryJa || !Array.isArray(parsed.questions)) return null;
    return {
      categoryJa: parsed.categoryJa,
      categoryEn: parsed.categoryEn ?? parsed.categoryJa,
      questions: parsed.questions.filter(
        (q) => q.id && q.promptJa && q.promptEn
      ) as InterviewCategoryMeta["questions"],
    };
  } catch {
    return null;
  }
}

export async function listInterviewQuestions(): Promise<InterviewQuestion[]> {
  const baseDir = getPatternImageDir("interview");
  let entries: string[];
  try {
    entries = await readdir(baseDir);
  } catch {
    return [];
  }

  const questions: InterviewQuestion[] = [];

  for (const entry of entries) {
    const categoryDir = path.join(baseDir, entry);
    const info = await stat(categoryDir).catch(() => null);
    if (!info?.isDirectory() || entry.startsWith("_")) continue;

    const meta = await readCategoryMeta(categoryDir);
    if (!meta) continue;

    for (const q of meta.questions) {
      const id = `${entry}/${q.id}`;
      questions.push({
        id,
        categoryId: entry,
        categoryJa: meta.categoryJa,
        categoryEn: meta.categoryEn,
        context: getInterviewContext(id),
        titleJa: q.titleJa ?? q.id,
        promptJa: q.promptJa,
        promptEn: q.promptEn,
      });
    }
  }

  return questions.sort((a, b) => a.id.localeCompare(b.id));
}
