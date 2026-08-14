export type PlanId = "free" | "standard" | "pro";

const STORAGE_KEY = "speaking-practice-plan";

export function getPlan(): PlanId {
  if (typeof window === "undefined") return "free";
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === "standard" || raw === "pro") return raw;
  } catch {
    // ignore
  }
  return "free";
}

/** For future billing integration / manual testing. */
export function setPlan(plan: PlanId) {
  if (plan === "free") {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, plan);
  }
}

export function canUseWordList(plan: PlanId = getPlan()): boolean {
  return plan === "standard" || plan === "pro";
}

export function planLabel(plan: PlanId): string {
  if (plan === "standard") return "Standard";
  if (plan === "pro") return "Pro";
  return "Free";
}
