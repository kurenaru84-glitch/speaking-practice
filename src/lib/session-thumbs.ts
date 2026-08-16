import type { PatternId } from "@/lib/patterns";
import type { CompareSet, RoleplayScenario, StorySet } from "@/lib/types";

export type SessionThumb = {
  index: number;
  label: string;
  thumbnail: string;
};

export function buildSessionThumbs(params: {
  patternId: PatternId;
  images: string[];
  stories: StorySet[];
  compareSets: CompareSet[];
  roleplayScenarios: RoleplayScenario[];
}): SessionThumb[] {
  const { patternId, images, stories, compareSets, roleplayScenarios } = params;

  if (patternId === "story") {
    return stories.map((story, index) => ({
      index,
      label: story.title,
      thumbnail: story.images[0] ?? "",
    })).filter((item) => item.thumbnail);
  }

  if (patternId === "compare") {
    return compareSets.map((set, index) => ({
      index,
      label: set.titleJa,
      thumbnail: set.images[0] ?? "",
    })).filter((item) => item.thumbnail);
  }

  if (patternId === "roleplay") {
    return roleplayScenarios.map((scenario, index) => ({
      index,
      label: scenario.categoryJa,
      thumbnail: scenario.image,
    })).filter((item) => item.thumbnail);
  }

  if (patternId === "describe" || patternId === "speculate") {
    return images.map((src, index) => {
      const filename = src.split("/").pop() ?? `Photo ${index + 1}`;
      return {
        index,
        label: filename.replace(/\.[^.]+$/, ""),
        thumbnail: src,
      };
    });
  }

  return [];
}

export function isSpeakingPattern(patternId: PatternId): boolean {
  return patternId === "describe" || patternId === "story" || patternId === "speculate" || patternId === "roleplay" || patternId === "compare";
}
