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

/** e.g. "/images/speculate/cafe.jpg" */
export function parseImageUrl(imageUrl: string, patternFolder: string) {
  const relative = imageUrl.replace(/^\/images\//, "");
  const parts = relative.split("/").filter(Boolean);

  let filename: string;
  if (parts.length === 1) {
    filename = path.basename(parts[0]);
  } else if (parts.length === 2 && parts[0] === patternFolder) {
    filename = path.basename(parts[1]);
  } else {
    throw new Error("画像パスが不正です。");
  }

  const dir = getPatternImageDir(patternFolder);
  const fullPath = path.join(dir, filename);
  if (!fullPath.startsWith(dir)) {
    throw new Error("画像が不正です。");
  }

  const mimeType = MIME[path.extname(filename).toLowerCase()] ?? "image/jpeg";
  return { fullPath, filename, mimeType, publicPath: `/images/${patternFolder}/${filename}` };
}

/** e.g. "/images/story/demo/01.jpg" */
export function parseStoryImageUrl(imageUrl: string) {
  const relative = imageUrl.replace(/^\/images\//, "");
  const parts = relative.split("/").filter(Boolean);
  if (parts.length !== 3 || parts[0] !== "story") {
    throw new Error("ストーリー画像パスが不正です。");
  }

  const setId = path.basename(parts[1]);
  const filename = path.basename(parts[2]);
  const dir = path.join(IMAGE_ROOT, "story", setId);
  const fullPath = path.join(dir, filename);
  if (!fullPath.startsWith(dir)) {
    throw new Error("画像が不正です。");
  }

  const mimeType = MIME[path.extname(filename).toLowerCase()] ?? "image/jpeg";
  return { fullPath, filename, mimeType, setId };
}

export function parseStoryImageUrls(imageUrls: string[]) {
  return imageUrls.map(parseStoryImageUrl);
}
