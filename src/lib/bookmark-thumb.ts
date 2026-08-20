import type { BookmarkEntry } from "@/lib/bookmarks";
import { catalogDataForPattern, type ImageCatalog } from "@/lib/image-catalog-types";
import type { PatternId } from "@/lib/patterns";
import { buildSessionThumbs } from "@/lib/session-thumbs";
import { findIndexByItemKey } from "@/lib/practice-item-key";

function thumbFromCompareEntry(entry: BookmarkEntry, catalog: ImageCatalog) {
  if (!entry.itemKey.startsWith("compare:")) return null;
  const setId = entry.itemKey.slice("compare:".length);
  const set = catalog.compareSets.find((item) => item.id === setId);
  if (!set?.images[0]) return null;
  return {
    thumbnail: set.images[0],
    label: set.titleJa,
    kind: "image" as const,
  };
}

export function resolveBookmarkThumb(
  entry: BookmarkEntry,
  catalog: ImageCatalog
): { thumbnail?: string; label: string; kind: "image" | "text" } {
  const patternId = entry.patternId as PatternId;
  const directCompare = thumbFromCompareEntry(entry, catalog);
  if (directCompare) return directCompare;

  const data = catalogDataForPattern(patternId, catalog);
  const index = findIndexByItemKey(patternId, entry.itemKey, data);

  const thumbs = buildSessionThumbs({
    patternId,
    images: data.images,
    stories: data.stories,
    compareSets: data.compareSets,
    roleplayScenarios: data.roleplayScenarios,
    interviewQuestions: data.interviewQuestions,
    emailScenarios: data.emailScenarios,
  });

  const thumb = thumbs.find((item) => item.index === index);
  return {
    thumbnail: thumb?.thumbnail,
    label: thumb?.label ?? entry.itemTitleJa,
    kind: thumb?.kind ?? "text",
  };
}
