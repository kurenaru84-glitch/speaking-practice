export type EmailScenarioType = "compose" | "reply";

export type EmailScenarioMeta = {
  id: string;
  type: EmailScenarioType;
  titleJa: string;
  promptJa: string;
  promptEn: string;
  incomingEmailJa?: string;
  incomingEmailEn?: string;
};

export type EmailCategoryMeta = {
  categoryJa: string;
  categoryEn: string;
  scenarios: EmailScenarioMeta[];
};

export type EmailScenario = {
  id: string;
  categoryId: string;
  categoryJa: string;
  categoryEn: string;
  type: EmailScenarioType;
  context: "business" | "personal";
  titleJa: string;
  promptJa: string;
  promptEn: string;
  incomingEmailJa?: string;
  incomingEmailEn?: string;
};
