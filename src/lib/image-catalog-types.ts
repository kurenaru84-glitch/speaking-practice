import type {
  CompareSet,
  EmailScenario,
  InterviewQuestion,
  RoleplayScenario,
  StorySet,
} from "@/lib/types";

export type ImageCatalog = {
  describeImages: string[];
  speculateImages: string[];
  stories: StorySet[];
  compareSets: CompareSet[];
  roleplayScenarios: RoleplayScenario[];
  interviewQuestions: InterviewQuestion[];
  emailScenarios: EmailScenario[];
};

export function catalogDataForPattern(
  patternId: string,
  catalog: ImageCatalog
): {
  images: string[];
  stories: StorySet[];
  compareSets: CompareSet[];
  roleplayScenarios: RoleplayScenario[];
  interviewQuestions: InterviewQuestion[];
  emailScenarios: EmailScenario[];
} {
  return {
    images: patternId === "speculate" ? catalog.speculateImages : catalog.describeImages,
    stories: catalog.stories,
    compareSets: catalog.compareSets,
    roleplayScenarios: catalog.roleplayScenarios,
    interviewQuestions: catalog.interviewQuestions,
    emailScenarios: catalog.emailScenarios,
  };
}

export const EMPTY_IMAGE_CATALOG: ImageCatalog = {
  describeImages: [],
  speculateImages: [],
  stories: [],
  compareSets: [],
  roleplayScenarios: [],
  interviewQuestions: [],
  emailScenarios: [],
};
