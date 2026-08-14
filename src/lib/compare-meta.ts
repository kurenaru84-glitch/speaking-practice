export type CompareMeta = {
  titleJa: string;
  titleEn?: string;
  labelA: string;
  labelB: string;
  promptJa: string;
  promptEn?: string;
};

export function defaultCompareMeta(setId: string): CompareMeta {
  return {
    titleJa: setId,
    titleEn: setId,
    labelA: "A",
    labelB: "B",
    promptJa: "A と B の写真を比べて、どちらを選ぶか理由とともに述べてください。",
    promptEn: "Compare photos A and B. Which would you choose and why?",
  };
}
