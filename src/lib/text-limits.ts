import type { PatternId } from "@/lib/patterns";
import type { PlanId } from "@/lib/plan";

export const RECORD_SECONDS_STANDARD = 60;
export const RECORD_SECONDS_PRO = 120;

/** ~200 English words — comfortable upper bound for 60s speaking. */
export const TEXT_LIMIT_SPEAKING_60S = 1200;

/** ~280 English words — comfortable upper bound for Pro 2-minute mode. */
export const TEXT_LIMIT_SPEAKING_120S = 2400;

/** Business email compose/reply — longer than spoken answers. */
export const TEXT_LIMIT_EMAIL = 2000;

export function getRecordSeconds(plan: PlanId = "free"): number {
  return plan === "pro" ? RECORD_SECONDS_PRO : RECORD_SECONDS_STANDARD;
}

export function getTextCharLimit(params: {
  patternId: PatternId;
  plan?: PlanId;
  recordSeconds?: number;
}): number {
  const { patternId, plan = "free", recordSeconds = getRecordSeconds(plan) } = params;

  if (patternId === "email") {
    return TEXT_LIMIT_EMAIL;
  }

  if (recordSeconds > RECORD_SECONDS_STANDARD) {
    return TEXT_LIMIT_SPEAKING_120S;
  }

  return TEXT_LIMIT_SPEAKING_60S;
}

export function textLimitMessage(limit: number): string {
  return `入力は${limit.toLocaleString("ja-JP")}文字以内にしてください（録音時間の目安に合わせた上限です）。`;
}
