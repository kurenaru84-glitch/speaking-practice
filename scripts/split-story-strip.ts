import { mkdir, readdir, unlink } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const STORY_ROOT = path.join(process.cwd(), "public", "images", "story");
const WEBP_QUALITY = 82;

type PanelCrop = { left: number; top: number; name: string; panelW: number; panelH: number };

async function splitStrip(inputPath: string, setId: string, layout: "grid" | "vertical") {
  const outDir = path.join(STORY_ROOT, setId);
  await mkdir(outDir, { recursive: true });

  const image = sharp(inputPath);
  const meta = await image.metadata();
  const width = meta.width;
  const height = meta.height;
  if (!width || !height) throw new Error(`Could not read dimensions: ${inputPath}`);

  const panels: PanelCrop[] =
    layout === "vertical"
      ? (() => {
          const panelH = Math.floor(height / 4);
          return [
            { left: 0, top: 0, name: "01", panelW: width, panelH },
            { left: 0, top: panelH, name: "02", panelW: width, panelH },
            { left: 0, top: panelH * 2, name: "03", panelW: width, panelH },
            { left: 0, top: panelH * 3, name: "04", panelW: width, panelH },
          ];
        })()
      : (() => {
          const panelW = Math.floor(width / 2);
          const panelH = Math.floor(height / 2);
          return [
            { left: 0, top: 0, name: "01", panelW, panelH },
            { left: panelW, top: 0, name: "02", panelW, panelH },
            { left: 0, top: panelH, name: "03", panelW, panelH },
            { left: panelW, top: panelH, name: "04", panelW, panelH },
          ];
        })();

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
        width: panel.panelW,
        height: panel.panelH,
      })
      .webp({ quality: WEBP_QUALITY })
      .toFile(output);
    console.log(`  ${setId}/${panel.name}.webp`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const vertical = args[0] === "--vertical";
  const pairs = vertical ? args.slice(1) : args;

  if (pairs.length === 0 || pairs.length % 2 !== 0) {
    console.error(
      "Usage: npx tsx scripts/split-story-strip.ts [--vertical] <strip.jpg> <set-id> [...]"
    );
    process.exit(1);
  }

  const layout = vertical ? "vertical" : "grid";
  console.log(`Splitting story strips (${layout} → 01–04)...\n`);
  for (let i = 0; i < pairs.length; i += 2) {
    const inputPath = path.resolve(pairs[i]!);
    const setId = pairs[i + 1]!;
    console.log(`${setId}:`);
    await splitStrip(inputPath, setId, layout);
  }
  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
