import sceneDescriptionsData from "@/data/scene-descriptions.json";

export type SceneDescriptionEntry = {
  imageUrl: string;
  patternId: "describe" | "speculate" | "roleplay";
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
