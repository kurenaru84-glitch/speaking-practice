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

export type ImagesResponse =
  | { pattern: string; images: string[]; stories?: undefined }
  | { pattern: string; stories: StorySet[]; images?: undefined };
