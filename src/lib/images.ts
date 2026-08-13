import path from "node:path";

const IMAGE_ROOT = path.join(process.cwd(), "public", "images");

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

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

/** e.g. "/images/speculate/cafe.jpg" -> { dir, filename, mimeType } */
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
