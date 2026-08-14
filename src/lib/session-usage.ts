import { FREE_TIER_ENABLED } from "@/lib/feature-flags";

const STORAGE_KEY = "speaking-practice-sessions";

export const FREE_DAILY_LIMIT = 2;
export const FREE_MONTHLY_LIMIT = 8;

type SessionLog = {
  timestamps: number[];
};

function readLog(): SessionLog {
  if (typeof window === "undefined") return { timestamps: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { timestamps: [] };
    const parsed = JSON.parse(raw) as SessionLog;
    return Array.isArray(parsed.timestamps) ? parsed : { timestamps: [] };
  } catch {
    return { timestamps: [] };
  }
}

function writeLog(log: SessionLog) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export type SessionUsage = {
  dailyUsed: number;
  monthlyUsed: number;
  dailyRemaining: number;
  monthlyRemaining: number;
  canUse: boolean;
};

export function getSessionUsage(now = new Date()): SessionUsage {
  if (!FREE_TIER_ENABLED) {
    return {
      dailyUsed: 0,
      monthlyUsed: 0,
      dailyRemaining: FREE_DAILY_LIMIT,
      monthlyRemaining: FREE_MONTHLY_LIMIT,
      canUse: true,
    };
  }

  const timestamps = readLog().timestamps;
  const dailyUsed = timestamps.filter((ts) => isSameDay(new Date(ts), now)).length;
  const monthlyUsed = timestamps.filter((ts) => isSameMonth(new Date(ts), now)).length;
  const dailyRemaining = Math.max(0, FREE_DAILY_LIMIT - dailyUsed);
  const monthlyRemaining = Math.max(0, FREE_MONTHLY_LIMIT - monthlyUsed);

  return {
    dailyUsed,
    monthlyUsed,
    dailyRemaining,
    monthlyRemaining,
    canUse: dailyRemaining > 0 && monthlyRemaining > 0,
  };
}

export function recordSession(now = Date.now()) {
  if (!FREE_TIER_ENABLED) return;
  const log = readLog();
  writeLog({ timestamps: [...log.timestamps, now] });
}

export function sessionLimitMessage(usage: SessionUsage): string {
  if (usage.dailyRemaining <= 0) {
    return `本日の無料枠（${FREE_DAILY_LIMIT}セッション）を使い切りました。明日またお試しください。`;
  }
  if (usage.monthlyRemaining <= 0) {
    return `今月の無料枠（${FREE_MONTHLY_LIMIT}セッション）を使い切りました。`;
  }
  return "";
}
