import type { PatternId } from "@/lib/patterns";
import type { CompareSet, EmailScenario, InterviewQuestion, RoleplayScenario, StorySet } from "@/lib/types";

export function buildPracticeItemKey(params: {
  patternId: PatternId;
  index: number;
  interview?: InterviewQuestion | null;
  email?: EmailScenario | null;
  compare?: CompareSet | null;
  roleplay?: RoleplayScenario | null;
  story?: StorySet | null;
  image?: string | null;
}): string {
  if (params.interview) return `interview:${params.interview.id}`;
  if (params.email) return `email:${params.email.id}`;
  if (params.compare) return `compare:${params.compare.id}`;
  if (params.roleplay) return `roleplay:${params.roleplay.id}`;
  if (params.story) return `story:${params.story.id}`;
  if (params.image) return `${params.patternId}:${params.image}`;
  return `${params.patternId}:${params.index}`;
}

export function getPracticeItemTitle(params: {
  patternLabel: string;
  interview?: InterviewQuestion | null;
  email?: EmailScenario | null;
  compare?: CompareSet | null;
  roleplay?: RoleplayScenario | null;
  story?: StorySet | null;
  index: number;
}): string {
  if (params.interview) return params.interview.titleJa;
  if (params.email) return params.email.titleJa;
  if (params.compare) return params.compare.titleJa;
  if (params.roleplay) return params.roleplay.categoryJa;
  if (params.story) return params.story.title;
  return `${params.patternLabel} ${params.index + 1}`;
}

export function findIndexByItemKey(
  patternId: PatternId,
  itemKey: string,
  data: {
    images: string[];
    stories: StorySet[];
    compareSets: CompareSet[];
    roleplayScenarios: RoleplayScenario[];
    interviewQuestions: InterviewQuestion[];
    emailScenarios: EmailScenario[];
  }
): number {
  if (patternId === "interview") {
    const idx = data.interviewQuestions.findIndex((q) => `interview:${q.id}` === itemKey);
    return idx >= 0 ? idx : 0;
  }
  if (patternId === "email") {
    const idx = data.emailScenarios.findIndex((s) => `email:${s.id}` === itemKey);
    return idx >= 0 ? idx : 0;
  }
  if (patternId === "compare") {
    const idx = data.compareSets.findIndex((s) => `compare:${s.id}` === itemKey);
    return idx >= 0 ? idx : 0;
  }
  if (patternId === "roleplay") {
    const idx = data.roleplayScenarios.findIndex((s) => `roleplay:${s.id}` === itemKey);
    return idx >= 0 ? idx : 0;
  }
  if (patternId === "story") {
    const idx = data.stories.findIndex((s) => `story:${s.id}` === itemKey);
    return idx >= 0 ? idx : 0;
  }
  if (itemKey.startsWith(`${patternId}:`)) {
    const suffix = itemKey.slice(patternId.length + 1);
    if (suffix.startsWith("/") || suffix.includes(".")) {
      const idx = data.images.indexOf(suffix);
      return idx >= 0 ? idx : 0;
    }
    const num = Number(suffix);
    if (!Number.isNaN(num)) return num;
  }
  return 0;
}
