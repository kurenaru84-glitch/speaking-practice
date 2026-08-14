import path from "node:path";

const IMAGE_ROOT = path.join(process.cwd(), "public", "images");

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

const IMAGE_EXT = new Set(Object.keys(MIME));

export function getImageRoot() {
  return IMAGE_ROOT;
}

export function getPatternImageDir(folder: string) {
  const dir = path.join(IMAGE_ROOT, folder);
  if (!dir.startsWith(IMAGE_ROOT)) {
    throw new Error("画像フォルダが不正です。");
  }
  return dir;
}

export function isImageFile(filename: string) {
  return IMAGE_EXT.has(path.extname(filename).toLowerCase());
}

/** e.g. "/images/speculate/cafe.jpg" or "/images/roleplay/comfort/01.jpg" */
export function parseImageUrl(imageUrl: string, patternFolder: string) {
  const relative = imageUrl.replace(/^\/images\//, "");
  const parts = relative.split("/").filter(Boolean);

  let filename: string;
  let dir: string;

  if (parts.length === 3 && parts[0] === patternFolder) {
    const category = path.basename(parts[1]);
    filename = path.basename(parts[2]);
    dir = path.join(getPatternImageDir(patternFolder), category);
  } else if (parts.length === 2 && parts[0] === patternFolder) {
    filename = path.basename(parts[1]);
    dir = getPatternImageDir(patternFolder);
  } else if (parts.length === 1) {
    filename = path.basename(parts[0]);
    dir = getPatternImageDir(patternFolder);
  } else {
    throw new Error("画像パスが不正です。");
  }

  const fullPath = path.join(dir, filename);
  if (!fullPath.startsWith(dir)) {
    throw new Error("画像が不正です。");
  }

  const mimeType = MIME[path.extname(filename).toLowerCase()] ?? "image/jpeg";
  const publicPath =
    parts.length === 3 && parts[0] === patternFolder
      ? `/images/${patternFolder}/${path.basename(parts[1])}/${filename}`
      : `/images/${patternFolder}/${filename}`;

  return { fullPath, filename, mimeType, publicPath };
}

/** e.g. "/images/story/demo/01.jpg" or "/images/compare/desks/a.jpg" */
export function parseSetImageUrl(imageUrl: string, patternFolder: string) {
  const relative = imageUrl.replace(/^\/images\//, "");
  const parts = relative.split("/").filter(Boolean);
  if (parts.length !== 3 || parts[0] !== patternFolder) {
    throw new Error("セット画像パスが不正です。");
  }

  const setId = path.basename(parts[1]);
  const filename = path.basename(parts[2]);
  const dir = path.join(IMAGE_ROOT, patternFolder, setId);
  const fullPath = path.join(dir, filename);
  if (!fullPath.startsWith(dir)) {
    throw new Error("画像が不正です。");
  }

  const mimeType = MIME[path.extname(filename).toLowerCase()] ?? "image/jpeg";
  return { fullPath, filename, mimeType, setId };
}

export function parseSetImageUrls(imageUrls: string[], patternFolder: string) {
  return imageUrls.map((url) => parseSetImageUrl(url, patternFolder));
}

/** @deprecated use parseSetImageUrl */
export function parseStoryImageUrl(imageUrl: string) {
  return parseSetImageUrl(imageUrl, "story");
}

export function parseStoryImageUrls(imageUrls: string[]) {
  return parseSetImageUrls(imageUrls, "story");
}
