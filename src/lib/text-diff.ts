export type WordDiffSegment = {
  type: "equal" | "remove" | "add";
  tokens: string[];
};

export type WordDiffResult = {
  originalSegments: WordDiffSegment[];
  fixedSegments: WordDiffSegment[];
  useFallback: boolean;
  changedTokenCount: number;
};

function tokenize(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean);
}

function pushSegment(segments: WordDiffSegment[], type: WordDiffSegment["type"], token: string) {
  const last = segments[segments.length - 1];
  if (last && last.type === type) {
    last.tokens.push(token);
  } else {
    segments.push({ type, tokens: [token] });
  }
}

function countChangedTokens(segments: WordDiffSegment[]): number {
  return segments
    .filter((segment) => segment.type !== "equal")
    .reduce((sum, segment) => sum + segment.tokens.length, 0);
}

function shouldFallback(
  originalTokens: string[],
  fixedTokens: string[],
  originalSegments: WordDiffSegment[],
  fixedSegments: WordDiffSegment[]
): boolean {
  const maxLen = Math.max(originalTokens.length, fixedTokens.length, 1);
  const changed = countChangedTokens(originalSegments) + countChangedTokens(fixedSegments);
  const changeRatio = changed / (maxLen * 2);
  const segmentCount = originalSegments.length + fixedSegments.length;

  if (changeRatio > 0.45) return true;
  if (changed > 6) return true;
  if (segmentCount > 10) return true;
  return false;
}

/** Word-level diff for short correction pairs (Method A). */
export function diffWordStrings(original: string, fixed: string): WordDiffResult {
  const originalTokens = tokenize(original);
  const fixedTokens = tokenize(fixed);

  if (originalTokens.length === 0 && fixedTokens.length === 0) {
    return {
      originalSegments: [],
      fixedSegments: [],
      useFallback: false,
      changedTokenCount: 0,
    };
  }

  if (original.trim() === fixed.trim()) {
    return {
      originalSegments: [{ type: "equal", tokens: originalTokens }],
      fixedSegments: [{ type: "equal", tokens: fixedTokens }],
      useFallback: false,
      changedTokenCount: 0,
    };
  }

  const n = originalTokens.length;
  const m = fixedTokens.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

  for (let i = n - 1; i >= 0; i -= 1) {
    for (let j = m - 1; j >= 0; j -= 1) {
      if (originalTokens[i].toLowerCase() === fixedTokens[j].toLowerCase()) {
        dp[i][j] = dp[i + 1][j + 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  const originalSegments: WordDiffSegment[] = [];
  const fixedSegments: WordDiffSegment[] = [];
  let i = 0;
  let j = 0;

  while (i < n && j < m) {
    if (originalTokens[i].toLowerCase() === fixedTokens[j].toLowerCase()) {
      pushSegment(originalSegments, "equal", originalTokens[i]);
      pushSegment(fixedSegments, "equal", fixedTokens[j]);
      i += 1;
      j += 1;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      pushSegment(originalSegments, "remove", originalTokens[i]);
      i += 1;
    } else {
      pushSegment(fixedSegments, "add", fixedTokens[j]);
      j += 1;
    }
  }

  while (i < n) {
    pushSegment(originalSegments, "remove", originalTokens[i]);
    i += 1;
  }

  while (j < m) {
    pushSegment(fixedSegments, "add", fixedTokens[j]);
    j += 1;
  }

  const changedTokenCount = countChangedTokens(originalSegments) + countChangedTokens(fixedSegments);
  const useFallback = shouldFallback(originalTokens, fixedTokens, originalSegments, fixedSegments);

  return {
    originalSegments,
    fixedSegments,
    useFallback,
    changedTokenCount,
  };
}

export function renderDiffTokens(tokens: string[]): string {
  return tokens.join(" ");
}
