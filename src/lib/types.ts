export type FeedbackResult = {
  corrections: Array<{
    original: string;
    fixed: string;
    note: string;
  }>;
  natural: string;
  summary: string;
};
