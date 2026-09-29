import { stat } from "node:fs/promises";
import sharp from "sharp";

/** Long edge cap for a single image sent to Gemini. */
export const FEEDBACK_IMAGE_MAX_EDGE = 384;
const JPEG_QUALITY = 75;

export type FeedbackImageInput = { base64: string; mimeType: string };
export type CompositeLayout = "vertical" | "horizontal";

const imageCache = new Map<string, FeedbackImageInput>();

async function cacheKey(fullPath: string) {
  const info = await stat(fullPath);
  return `${fullPath}:${info.mtimeMs}`;
}

async function toJpegBuffer(fullPath: string, maxEdge: number) {
  return sharp(fullPath)
    .rotate()
    .resize(maxEdge, maxEdge, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toBuffer();
}

function toInput(buffer: Buffer): FeedbackImageInput {
  return {
    base64: buffer.toString("base64"),
    mimeType: "image/jpeg",
  };
}

export async function readImageForFeedback(fullPath: string): Promise<FeedbackImageInput> {
  const key = await cacheKey(fullPath);
  const cached = imageCache.get(key);
  if (cached) return cached;

  const result = toInput(await toJpegBuffer(fullPath, FEEDBACK_IMAGE_MAX_EDGE));
  imageCache.set(key, result);
  return result;
}

async function compositePanels(fullPaths: string[], layout: CompositeLayout): Promise<FeedbackImageInput> {
  const cacheId = `${layout}:${(await Promise.all(fullPaths.map((p) => cacheKey(p)))).join("|")}`;
  const cached = imageCache.get(cacheId);
  if (cached) return cached;

  const panelBuffers = await Promise.all(
    fullPaths.map((fullPath) => toJpegBuffer(fullPath, FEEDBACK_IMAGE_MAX_EDGE))
  );
  const metas = await Promise.all(panelBuffers.map((buffer) => sharp(buffer).metadata()));

  if (layout === "vertical") {
    const width = Math.max(...metas.map((meta) => meta.width ?? 0));
    const height = metas.reduce((sum, meta) => sum + (meta.height ?? 0), 0);
    let top = 0;
    const composites = panelBuffers.map((input, index) => {
      const composite = { input, top, left: 0 };
      top += metas[index].height ?? 0;
      return composite;
    });
    const buffer = await sharp({
      create: { width, height, channels: 3, background: "#ffffff" },
    })
      .composite(composites)
      .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
      .toBuffer();
    const result = toInput(buffer);
    imageCache.set(cacheId, result);
    return result;
  }

  const height = Math.max(...metas.map((meta) => meta.height ?? 0));
  const width = metas.reduce((sum, meta) => sum + (meta.width ?? 0), 0);
  let left = 0;
  const composites = panelBuffers.map((input, index) => {
    const composite = { input, top: 0, left };
    left += metas[index].width ?? 0;
    return composite;
  });
  const buffer = await sharp({
    create: { width, height, channels: 3, background: "#ffffff" },
  })
    .composite(composites)
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toBuffer();
  const result = toInput(buffer);
  imageCache.set(cacheId, result);
  return result;
}

/** Multi-image sets are merged into one strip/grid so Gemini receives a single image. */
export async function readImagesForFeedback(
  fullPaths: string[],
  layout: CompositeLayout = "vertical"
): Promise<FeedbackImageInput[]> {
  if (fullPaths.length === 0) return [];
  if (fullPaths.length === 1) return [await readImageForFeedback(fullPaths[0])];
  return [await compositePanels(fullPaths, layout)];
}
