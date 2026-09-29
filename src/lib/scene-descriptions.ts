import sceneDescriptionsData from "@/data/scene-descriptions.json";

export type SceneDescriptionEntry = {
  imageUrl: string;
  patternId: "describe" | "speculate" | "roleplay" | "compare";
  descriptionEn: string;
};

const byUrl = new Map<string, SceneDescriptionEntry>(
  (sceneDescriptionsData as SceneDescriptionEntry[]).map((entry) => [entry.imageUrl, entry])
);

export function getSceneDescription(imageUrl: string): string | undefined {
  return byUrl.get(imageUrl)?.descriptionEn.trim() || undefined;
}

export function hasSceneDescription(imageUrl: string): boolean {
  return Boolean(getSceneDescription(imageUrl));
}

function compareSideUrl(urls: string[], side: "a" | "b"): string | undefined {
  const marker = `/${side}.`;
  return urls.find((url) => url.includes(marker)) ?? (side === "a" ? urls[0] : urls[1]);
}

export function getCompareSceneDescription(
  imageUrls: string[],
  labelA = "A",
  labelB = "B"
): string | undefined {
  if (imageUrls.length < 2) return undefined;
  const urlA = compareSideUrl(imageUrls, "a");
  const urlB = compareSideUrl(imageUrls, "b");
  if (!urlA || !urlB) return undefined;
  const descA = getSceneDescription(urlA);
  const descB = getSceneDescription(urlB);
  if (!descA || !descB) return undefined;
  return `Image ${labelA} (learner's left / option A):\n${descA}\n\nImage ${labelB} (learner's right / option B):\n${descB}`;
}
