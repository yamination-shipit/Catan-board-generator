import type { SeedHistoryEntry } from "../types.ts";

export const MAX_HISTORY = 12;

export function upsertSeedHistory(
  history: readonly SeedHistoryEntry[],
  entry: SeedHistoryEntry,
  maxHistory = MAX_HISTORY,
): readonly SeedHistoryEntry[] {
  const withoutDuplicate = history.filter((item) => !isSameBoardChoice(item, entry));
  return [entry, ...withoutDuplicate].slice(0, maxHistory);
}

function isSameBoardChoice(left: SeedHistoryEntry, right: SeedHistoryEntry): boolean {
  return left.seed === right.seed &&
    left.mode === right.mode &&
    left.variant === right.variant &&
    left.challenges.join(",") === right.challenges.join(",") &&
    (left.expansions ?? []).join(",") === (right.expansions ?? []).join(",") &&
    (left.rulePreset ?? "balanced-neutral") === (right.rulePreset ?? "balanced-neutral") &&
    (left.balanceProfile ?? "classic") === (right.balanceProfile ?? "classic");
}
