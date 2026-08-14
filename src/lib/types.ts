export type SentenceFeedback = {
  original: string;
  fixed: string;
  comment: string;
};

export type VocabularyItem = {
  term: string;
  note: string;
};

export type NaturalExample = {
  text: string;
  translationJa: string;
};

export type FeedbackResult = {
  sentences: SentenceFeedback[];
  natural: NaturalExample[];
  vocabulary: VocabularyItem[];
  summary: string;
};

export type StorySet = {
  id: string;
  title: string;
  images: string[];
};

export type CompareSet = {
  id: string;
  title: string;
  titleJa: string;
  titleEn: string;
  labelA: string;
  labelB: string;
  promptJa: string;
  promptEn: string;
  images: string[];
};

export type RoleplayScenario = {
  id: string;
  categoryId: string;
  categoryJa: string;
  categoryEn: string;
  image: string;
  promptJa: string;
  promptEn: string;
};

export type ImagesResponse =
  | { pattern: string; images: string[]; stories?: undefined; compareSets?: undefined; roleplayScenarios?: undefined }
  | { pattern: string; stories: StorySet[]; images?: undefined; compareSets?: undefined; roleplayScenarios?: undefined }
  | { pattern: string; compareSets: CompareSet[]; images?: undefined; stories?: undefined; roleplayScenarios?: undefined }
  | { pattern: string; roleplayScenarios: RoleplayScenario[]; images?: undefined; stories?: undefined; compareSets?: undefined };
