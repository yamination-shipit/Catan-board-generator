import type {
  Challenge,
  GenerationOptions,
  GenerationSelection,
  GhostSettlement,
  Mode,
  Port,
  Resource,
  Variant,
} from "../types.ts";
import {
  COMPACT_EXTRA_GHOST_SETTLEMENTS,
  COMPACT_GHOST_SETTLEMENTS,
  COMPACT_PORTS,
  EXTRA_GHOST_SETTLEMENTS,
  GHOST_SETTLEMENTS,
  PORTS,
  RESOURCES,
} from "./rules.ts";
import { createRandomState, hashSeed, nextInt, shuffle } from "./rng.ts";

const resourceKeys = Object.keys(RESOURCES).filter((resource) =>
  resource !== "desert"
) as Resource[];

export const defaultSelection: GenerationSelection = {
  mode: "3-4",
  variant: "full-neutral",
  challenges: [],
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
  return values.filter((value): value is Challenge => valid.includes(value as Challenge));
}

export function getGenerationOptions(
  seed: string,
  selection: GenerationSelection,
): GenerationOptions {
  const layoutKey = selection.mode === "2" && selection.variant.startsWith("compact")
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
  const basePorts = options.compact ? COMPACT_PORTS : PORTS;
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

function chooseScarceResource(seed: string): Resource {
  const result = nextInt(
    createRandomState(hashSeed(`${seed}:challenges`)),
    0,
    resourceKeys.length - 1,
  );
  return resourceKeys[result.value] as Resource;
}
