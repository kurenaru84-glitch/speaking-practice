import type { PatternId } from "@/lib/patterns";
import type { CompareSet, EmailScenario, InterviewQuestion, RoleplayScenario, StorySet } from "@/lib/types";

export type SessionThumb = {
  index: number;
  label: string;
  subtitle?: string;
  thumbnail?: string;
  kind: "image" | "text";
  badge?: string;
};

function truncate(text: string, max: number) {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max)}…`;
}

export function buildSessionThumbs(params: {
  patternId: PatternId;
  images: string[];
  stories: StorySet[];
  compareSets: CompareSet[];
  roleplayScenarios: RoleplayScenario[];
  interviewQuestions?: InterviewQuestion[];
  emailScenarios?: EmailScenario[];
}): SessionThumb[] {
  const {
    patternId,
    images,
    stories,
    compareSets,
    roleplayScenarios,
    interviewQuestions = [],
    emailScenarios = [],
  } = params;

  if (patternId === "interview") {
    return interviewQuestions.map((question, index) => ({
      index,
      kind: "text" as const,
      label: question.titleJa,
      subtitle: truncate(question.promptJa, 72),
      badge: question.context === "behavioral" ? "面接" : "自分について",
    }));
  }

  if (patternId === "email") {
    return emailScenarios.map((scenario, index) => ({
      index,
      kind: "text" as const,
      label: scenario.titleJa,
      subtitle: truncate(scenario.promptJa, 72),
      badge: scenario.type === "reply" ? "返信" : "新規",
    }));
  }

  if (patternId === "story") {
    return stories
      .map((story, index) => ({
        index,
        kind: "image" as const,
        label: `ストーリー ${index + 1}`,
        thumbnail: story.images[0] ?? "",
      }))
      .filter((item) => item.thumbnail);
  }

  if (patternId === "compare") {
    return compareSets
      .map((set, index) => ({
        index,
        kind: "image" as const,
        label: set.titleJa,
        thumbnail: set.images[0] ?? "",
      }))
      .filter((item) => item.thumbnail);
  }

  if (patternId === "roleplay") {
    return roleplayScenarios
      .map((scenario, index) => ({
        index,
        kind: "image" as const,
        label: scenario.categoryJa,
        thumbnail: scenario.image,
      }))
      .filter((item) => item.thumbnail);
  }

  if (patternId === "describe" || patternId === "speculate") {
    return images.map((src, index) => ({
      index,
      kind: "image" as const,
      label: `写真 ${index + 1}`,
      thumbnail: src,
    }));
  }

  return [];
}
