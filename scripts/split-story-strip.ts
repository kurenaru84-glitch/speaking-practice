import { mkdir, readdir, unlink } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const STORY_ROOT = path.join(process.cwd(), "public", "images", "story");
const WEBP_QUALITY = 82;

type PanelCrop = { left: number; top: number; name: string };

async function splitStrip(inputPath: string, setId: string) {
  const outDir = path.join(STORY_ROOT, setId);
  await mkdir(outDir, { recursive: true });

  const image = sharp(inputPath);
  const meta = await image.metadata();
  const width = meta.width;
  const height = meta.height;
  if (!width || !height) throw new Error(`Could not read dimensions: ${inputPath}`);

  const panelW = Math.floor(width / 2);
  const panelH = Math.floor(height / 2);
  const panels: PanelCrop[] = [
    { left: 0, top: 0, name: "01" },
    { left: panelW, top: 0, name: "02" },
    { left: 0, top: panelH, name: "03" },
    { left: panelW, top: panelH, name: "04" },
  ];

  const existing = await readdir(outDir).catch(() => [] as string[]);
  for (const file of existing) {
    if (/\.(webp|jpg|jpeg|png)$/i.test(file)) {
      await unlink(path.join(outDir, file));
    }
  }

  for (const panel of panels) {
    const output = path.join(outDir, `${panel.name}.webp`);
    await sharp(inputPath)
      .extract({
        left: panel.left,
        top: panel.top,
        width: panelW,
        height: panelH,
      })
      .webp({ quality: WEBP_QUALITY })
      .toFile(output);
    console.log(`  ${setId}/${panel.name}.webp`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.length % 2 !== 0) {
    console.error("Usage: npx tsx scripts/split-story-strip.ts <strip.jpg> <set-id> [...]");
    process.exit(1);
  }

  console.log("Splitting story strips (2x2 → 01–04)...\n");
  for (let i = 0; i < args.length; i += 2) {
    const inputPath = path.resolve(args[i]!);
    const setId = args[i + 1]!;
    console.log(`${setId}:`);
    await splitStrip(inputPath, setId);
  }
  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
