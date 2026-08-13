export type FeedbackResult = {
  corrections: Array<{
    original: string;
    fixed: string;
    note: string;
  }>;
  natural: string;
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
