import type { PlanId } from "@/lib/plan";
import {
  RECORD_SECONDS_PRO,
  RECORD_SECONDS_STANDARD,
  type RecordDurationSeconds,
} from "@/lib/text-limits";

const STORAGE_KEY = "pikuspi-record-duration";

export function canUnlockExtendedRecording(plan: PlanId): boolean {
  return plan === "pro";
}

export function getSavedRecordDuration(): RecordDurationSeconds {
  if (typeof window === "undefined") return RECORD_SECONDS_STANDARD;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === String(RECORD_SECONDS_PRO)) return RECORD_SECONDS_PRO;
  } catch {
    // ignore
  }
  return RECORD_SECONDS_STANDARD;
}

export function saveRecordDuration(seconds: RecordDurationSeconds) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, String(seconds));
}

export function resolveRecordSeconds(
  plan: PlanId,
  chosen: RecordDurationSeconds
): number {
  if (canUnlockExtendedRecording(plan) && chosen === RECORD_SECONDS_PRO) {
    return RECORD_SECONDS_PRO;
  }
  return RECORD_SECONDS_STANDARD;
}
