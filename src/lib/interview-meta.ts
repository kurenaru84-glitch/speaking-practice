export type InterviewQuestionMeta = {
  id: string;
  titleJa: string;
  promptJa: string;
  promptEn: string;
};

export type InterviewCategoryMeta = {
  categoryJa: string;
  categoryEn: string;
  questions: InterviewQuestionMeta[];
};

export type InterviewQuestion = {
  id: string;
  categoryId: string;
  categoryJa: string;
  categoryEn: string;
  context: "personal" | "behavioral";
  titleJa: string;
  promptJa: string;
  promptEn: string;
};
