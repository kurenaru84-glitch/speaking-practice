import { mkdir, readdir, readFile, rename, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const IMAGE_ROOT = path.join(process.cwd(), "public", "images");
const BACKUP_ROOT = path.join(IMAGE_ROOT, ".originals-backup");
const MAX_EDGE = 1200;
const WEBP_QUALITY = 82;
const INPUT_EXT = new Set([".jpg", ".jpeg", ".png"]);

type Stats = {
  processed: number;
  skipped: number;
  beforeBytes: number;
  afterBytes: number;
  metaFilesUpdated: number;
};

async function walkImages(dir: string, files: string[] = []): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkImages(fullPath, files);
      continue;
    }
    const ext = path.extname(entry.name).toLowerCase();
    if (INPUT_EXT.has(ext)) files.push(fullPath);
  }
  return files;
}


async function optimizeOne(filePath: string, stats: Stats) {
  const ext = path.extname(filePath).toLowerCase();
  const outputPath = path.join(path.dirname(filePath), `${path.basename(filePath, ext)}.webp`);

  if (ext === ".webp") {
    stats.skipped += 1;
    return;
  }

  const before = (await stat(filePath)).size;
  const tempPath = `${outputPath}.tmp`;

  await sharp(filePath)
    .rotate()
    .resize(MAX_EDGE, MAX_EDGE, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY, effort: 4 })
    .toFile(tempPath);

  const after = (await stat(tempPath)).size;

  if (after >= before && ext !== ".png") {
    await unlink(tempPath);
    stats.skipped += 1;
    return;
  }

  const relative = path.relative(IMAGE_ROOT, filePath);
  const backupPath = path.join(BACKUP_ROOT, relative);
  await mkdir(path.dirname(backupPath), { recursive: true });
  await rename(filePath, backupPath);
  await rename(tempPath, outputPath);

  stats.processed += 1;
  stats.beforeBytes += before;
  stats.afterBytes += after;
}

async function updateRoleplayMetaFiles() {
  let updated = 0;
  const roleplayRoot = path.join(IMAGE_ROOT, "roleplay");
  let categories: string[];
  try {
    categories = await readdir(roleplayRoot);
  } catch {
    return 0;
  }

  for (const category of categories) {
    const metaPath = path.join(roleplayRoot, category, "meta.json");
    try {
      const raw = await readFile(metaPath, "utf8");
      const next = raw.replace(/"file":\s*"([^"]+)\.(jpe?g|png)"/gi, (_match, base) => {
        return `"file": "${base}.webp"`;
      });
      if (next !== raw) {
        await writeFile(metaPath, next, "utf8");
        updated += 1;
      }
    } catch {
      // no meta.json in this folder
    }
  }

  return updated;
}

async function main() {
  const files = await walkImages(IMAGE_ROOT);
  const stats: Stats = {
    processed: 0,
    skipped: 0,
    beforeBytes: 0,
    afterBytes: 0,
    metaFilesUpdated: 0,
  };

  console.log(`Found ${files.length} images under public/images`);
  console.log(`Target: WebP q${WEBP_QUALITY}, max ${MAX_EDGE}px edge`);
  console.log(`Originals backup: ${path.relative(process.cwd(), BACKUP_ROOT)}`);
  console.log("");

  for (const filePath of files) {
    const relative = path.relative(IMAGE_ROOT, filePath);
    process.stdout.write(`Optimizing ${relative}... `);
    try {
      await optimizeOne(filePath, stats);
      console.log("done");
    } catch (error) {
      console.log("failed");
      console.error(error);
    }
  }

  stats.metaFilesUpdated = await updateRoleplayMetaFiles();

  console.log("");
  console.log("Summary");
  console.log(`  Converted: ${stats.processed}`);
  console.log(`  Skipped:   ${stats.skipped}`);
  console.log(
    `  Size:      ${(stats.beforeBytes / 1024 / 1024).toFixed(1)} MB -> ${(stats.afterBytes / 1024 / 1024).toFixed(1)} MB`
  );
  if (stats.beforeBytes > 0) {
    const ratio = ((1 - stats.afterBytes / stats.beforeBytes) * 100).toFixed(0);
    console.log(`  Saved:     ~${ratio}%`);
  }
  console.log(`  Meta updated: ${stats.metaFilesUpdated} roleplay meta.json file(s)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
