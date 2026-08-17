import type { BookmarkEntry } from "@/lib/bookmarks";
import type { PatternId } from "@/lib/patterns";
import type { ImagesResponse } from "@/lib/types";
import { buildSessionThumbs } from "@/lib/session-thumbs";
import { findIndexByItemKey } from "@/lib/practice-item-key";

export function resolveBookmarkThumb(
  entry: BookmarkEntry,
  data: ImagesResponse
): { thumbnail?: string; label: string; kind: "image" | "text" } {
  const patternId = entry.patternId as PatternId;
  const index = findIndexByItemKey(patternId, entry.itemKey, {
    images: data.images ?? [],
    stories: data.stories ?? [],
    compareSets: data.compareSets ?? [],
    roleplayScenarios: data.roleplayScenarios ?? [],
    interviewQuestions: data.interviewQuestions ?? [],
    emailScenarios: data.emailScenarios ?? [],
  });

  const thumbs = buildSessionThumbs({
    patternId,
    images: data.images ?? [],
    stories: data.stories ?? [],
    compareSets: data.compareSets ?? [],
    roleplayScenarios: data.roleplayScenarios ?? [],
    interviewQuestions: data.interviewQuestions ?? [],
    emailScenarios: data.emailScenarios ?? [],
  });

  const thumb = thumbs.find((item) => item.index === index);
  return {
    thumbnail: thumb?.thumbnail,
    label: thumb?.label ?? entry.itemTitleJa,
    kind: thumb?.kind ?? "text",
  };
}
