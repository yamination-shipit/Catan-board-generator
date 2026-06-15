import type {
  Challenge,
  Expansion,
  GenerationOptions,
  GenerationSelection,
  GhostSettlement,
  Mode,
  Port,
  Resource,
  RulePreset,
  Variant,
} from "../types.ts";
import {
  COMPACT_EXTRA_GHOST_SETTLEMENTS,
  COMPACT_GHOST_SETTLEMENTS,
  COMPACT_PORTS,
  EXTRA_GHOST_SETTLEMENTS,
  FIVE_SIX_PORTS,
  GHOST_SETTLEMENTS,
  PORTS,
  RESOURCES,
  SEAFARERS_PORTS,
} from "./rules.ts";
import { createRandomState, hashSeed, nextInt, shuffle } from "./rng.ts";

const resourceKeys = Object.keys(RESOURCES).filter((resource) =>
  !["desert", "gold", "sea"].includes(resource)
) as Resource[];

export const defaultSelection: GenerationSelection = {
  mode: "3-4",
  variant: "full-neutral",
  challenges: [],
  expansions: [],
  rulePreset: "balanced-neutral",
};

export function normalizeMode(value: string | null): Mode {
  return value === "2" ? "2" : "3-4";
}

export function normalizeVariant(value: string | null): Variant {
  const variants: readonly Variant[] = [
    "full-neutral",
    "full-open",
    "full-tight",
    "compact-duel",
    "compact-tight",
  ];
  return variants.includes(value as Variant) ? value as Variant : "full-neutral";
}

export function normalizeChallenges(values: readonly string[]): readonly Challenge[] {
  const valid: readonly Challenge[] = ["scarce", "harbors", "neutral"];
  return uniqueKnown(values, valid);
}

export function normalizeExpansions(values: readonly string[]): readonly Expansion[] {
  const valid: readonly Expansion[] = ["five-six-players", "seafarers", "cities-knights"];
  return uniqueKnown(values, valid);
}

export function normalizeRulePreset(value: string | null): RulePreset {
  const presets: readonly RulePreset[] = ["balanced-neutral", "open-duel", "long-game"];
  return presets.includes(value as RulePreset) ? value as RulePreset : "balanced-neutral";
}

export function getGenerationOptions(
  seed: string,
  selection: GenerationSelection,
): GenerationOptions {
  const layoutKey = selection.expansions.includes("seafarers")
    ? "seafarers"
    : selection.expansions.includes("five-six-players")
    ? "5-6"
    : selection.mode === "2" && selection.variant.startsWith("compact")
    ? "compact"
    : selection.mode;
  const scarceResource = selection.challenges.includes("scarce")
    ? chooseScarceResource(seed)
    : null;

  return {
    layoutKey,
    compact: layoutKey === "compact",
    variant: selection.variant,
    challenges: [...selection.challenges],
    expansions: [...selection.expansions],
    rulePreset: selection.rulePreset,
    scarceResource,
  };
}

export function getGhostSettlements(
  mode: Mode,
  variant: Variant,
  challenges: readonly Challenge[],
): readonly GhostSettlement[] {
  if (mode !== "2" || variant === "full-open" || variant === "compact-duel") return [];
  if (variant === "compact-tight") {
    return challenges.includes("neutral")
      ? [...COMPACT_GHOST_SETTLEMENTS, ...COMPACT_EXTRA_GHOST_SETTLEMENTS]
      : COMPACT_GHOST_SETTLEMENTS;
  }
  if (variant === "full-tight" || challenges.includes("neutral")) {
    return [...GHOST_SETTLEMENTS, ...EXTRA_GHOST_SETTLEMENTS];
  }
  return GHOST_SETTLEMENTS;
}

export function getPortsForOptions(seed: string, options: GenerationOptions): readonly Port[] {
  const basePorts = getBasePorts(options);
  if (!options.challenges.includes("harbors")) return basePorts;

  const shuffled = shuffle(
    createRandomState(hashSeed(`${seed}:ports`)),
    basePorts.map((port) => ({
      type: port.type,
      label: port.label,
      shortLabel: port.shortLabel,
    })),
  ).value;

  return basePorts.map((port, index) => ({
    ...port,
    ...shuffled[index],
  }));
}

function getBasePorts(options: GenerationOptions): readonly Port[] {
  if (options.layoutKey === "seafarers") return SEAFARERS_PORTS;
  if (options.layoutKey === "5-6") return FIVE_SIX_PORTS;
  return options.compact ? COMPACT_PORTS : PORTS;
}

function chooseScarceResource(seed: string): Resource {
  const result = nextInt(
    createRandomState(hashSeed(`${seed}:challenges`)),
    0,
    resourceKeys.length - 1,
  );
  return resourceKeys[result.value] as Resource;
}

function uniqueKnown<T extends string>(
  values: readonly string[],
  valid: readonly T[],
): readonly T[] {
  return [...new Set(values)].filter((value): value is T => valid.includes(value as T));
}
