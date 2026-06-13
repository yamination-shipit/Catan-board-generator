import type { GenerationSelection } from "../types.ts";
import {
  defaultSelection,
  normalizeChallenges,
  normalizeMode,
  normalizeVariant,
} from "./options.ts";

export function parseShareSearch(search: string): {
  readonly seed: string | null;
  readonly selection: GenerationSelection;
} {
  const params = new URLSearchParams(search);
  const rawChallenges = params.get("challenges")?.split(",") ?? [];
  return {
    seed: params.get("seed"),
    selection: {
      mode: normalizeMode(params.get("mode")),
      variant: normalizeVariant(params.get("variant")),
      challenges: normalizeChallenges(rawChallenges),
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

  return url.toString();
}
