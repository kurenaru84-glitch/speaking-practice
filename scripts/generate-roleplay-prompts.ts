import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { generateRoleplayScenarioPrompt } from "../src/lib/gemini";
import { isImageFile } from "../src/lib/images";
import {
  defaultCategoryLabels,
  type RoleplayMeta,
  type RoleplayMetaImage,
} from "../src/lib/roleplay-meta";
import { getRoleplayMetaPath, loadRoleplayMeta } from "../src/lib/roleplay";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

function loadApiKey() {
  const fromEnv = process.env.GEMINI_API_KEY?.trim();
  if (fromEnv) return fromEnv;
  try {
    const raw = require("node:fs").readFileSync(
      path.join(process.cwd(), ".env.local"),
      "utf8"
    ) as string;
    for (const line of raw.split("\n")) {
      const match = line.match(/^GEMINI_API_KEY=(.+)$/);
      if (match) return match[1].trim();
    }
  } catch {
    // ignore
  }
  throw new Error("GEMINI_API_KEY が見つかりません。.env.local を確認してください。");
}

async function main() {
  process.env.GEMINI_API_KEY = loadApiKey();
  const force = process.argv.includes("--force");
  const baseDir = path.join(process.cwd(), "public", "images", "roleplay");
  const entries = await readdir(baseDir);

  for (const entry of entries) {
    const categoryDir = path.join(baseDir, entry);
    const info = await stat(categoryDir).catch(() => null);
    if (!info?.isDirectory() || entry.startsWith("_")) continue;

    const meta = await loadRoleplayMeta(entry);
    const files = (await readdir(categoryDir)).filter(isImageFile).sort();
    const byFile = new Map(meta.images.map((item) => [item.file, item]));
    let updated = 0;

    for (const file of files) {
      const existing = byFile.get(file);
      if (existing?.promptJa?.trim() && existing.promptEn?.trim() && !force) continue;

      const fullPath = path.join(categoryDir, file);
      const buffer = await readFile(fullPath);
      const mimeType = MIME[path.extname(file).toLowerCase()] ?? "image/jpeg";
      const labels = defaultCategoryLabels(entry);

      console.log(`Generating: ${entry}/${file}`);
      const generated = await generateRoleplayScenarioPrompt({
        imageBase64: buffer.toString("base64"),
        mimeType,
        categoryJa: meta.categoryJa || labels.ja,
        categoryEn: meta.categoryEn || labels.en,
      });

      byFile.set(file, {
        file,
        promptJa: generated.promptJa,
        promptEn: generated.promptEn,
      });
      updated += 1;
    }

    if (updated === 0) {
      console.log(`Skip ${entry}: all prompts exist (use --force to regenerate)`);
      continue;
    }

    const nextMeta: RoleplayMeta = {
      categoryJa: meta.categoryJa,
      categoryEn: meta.categoryEn,
      images: files
        .map((file) => byFile.get(file))
        .filter((item): item is RoleplayMetaImage => Boolean(item)),
    };

    await writeFile(getRoleplayMetaPath(entry), `${JSON.stringify(nextMeta, null, 2)}\n`, "utf8");
    console.log(`Updated ${entry}/meta.json (${updated} image(s))`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
