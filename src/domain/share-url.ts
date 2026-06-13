import type { GenerationSelection } from "../types.ts";
import {
  defaultSelection,
  normalizeChallenges,
  normalizeExpansions,
  normalizeMode,
  normalizeRulePreset,
  normalizeVariant,
} from "./options.ts";

export function parseShareSearch(search: string): {
  readonly seed: string | null;
  readonly selection: GenerationSelection;
} {
  const params = new URLSearchParams(search);
  const rawChallenges = params.get("challenges")?.split(",") ?? [];
  const rawExpansions = params.get("expansions")?.split(",") ?? [];
  return {
    seed: params.get("seed"),
    selection: {
      mode: normalizeMode(params.get("mode")),
      variant: normalizeVariant(params.get("variant")),
      challenges: normalizeChallenges(rawChallenges),
      expansions: normalizeExpansions(rawExpansions),
      rulePreset: normalizeRulePreset(params.get("rules")),
    },
  };
}

export function createShareUrl(
  currentUrl: string,
  seed: string,
  selection: GenerationSelection = defaultSelection,
): string {
  const url = new URL(currentUrl);
  url.searchParams.set("seed", seed);
  url.searchParams.set("mode", selection.mode);

  if (selection.mode === "2") {
    url.searchParams.set("variant", selection.variant);
  } else {
    url.searchParams.delete("variant");
  }

  if (selection.challenges.length > 0) {
    url.searchParams.set("challenges", selection.challenges.join(","));
  } else {
    url.searchParams.delete("challenges");
  }

  if (selection.expansions.length > 0) {
    url.searchParams.set("expansions", selection.expansions.join(","));
  } else {
    url.searchParams.delete("expansions");
  }

  if (selection.mode === "2" && selection.rulePreset !== defaultSelection.rulePreset) {
    url.searchParams.set("rules", selection.rulePreset);
  } else {
    url.searchParams.delete("rules");
  }

  return url.toString();
}
