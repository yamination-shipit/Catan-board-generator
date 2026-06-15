import type {
  BoardView,
  GenerationOptions,
  GenerationSelection,
  Hex,
  LayoutKey,
  Resource,
} from "../types.ts";
import { getGenerationOptions, getPortsForOptions } from "./options.ts";
import { LAYOUTS, NUMBER_DISTRIBUTION, NUMBER_PIPS, RESOURCE_DISTRIBUTION } from "./rules.ts";
import { createRandomState, hashSeed, type RandomState, shuffle } from "./rng.ts";
import { calculateDifficultyRating, evaluateBoard } from "./scoring.ts";

export function createBoardView(seed: string, selection: GenerationSelection): BoardView {
  const options = getGenerationOptions(seed, selection);
  const board = generateBalancedBoard(seed, options);
  const ports = getPortsForOptions(seed, options);
  return {
    seed,
    selection: {
      mode: selection.mode,
      variant: selection.variant,
      challenges: [...selection.challenges],
      expansions: [...selection.expansions],
      rulePreset: selection.rulePreset,
    },
    options,
    board,
    ports,
    difficulty: calculateDifficultyRating(board, selection.mode, options, ports),
  };
}

export function generateBalancedBoard(
  seed: string,
  options: GenerationOptions,
  maxAttempts = 100,
): readonly Hex[] {
  let state = createRandomState(hashSeed(seed));
  let bestBoard: readonly Hex[] = [];
  let bestScore = Number.NEGATIVE_INFINITY;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = generateRandomBoard(state, options.layoutKey);
    state = result.state;
    const score = evaluateBoard(result.value, options);

    if (score > bestScore) {
      bestScore = score;
      bestBoard = result.value;
    }

    if (score >= 0.95) break;
  }

  return bestBoard;
}

export function generateRandomBoard(
  state: RandomState,
  layoutKey: LayoutKey,
): { readonly state: RandomState; readonly value: readonly Hex[] } {
  const layout = LAYOUTS[layoutKey];
  const resourcePool = createResourcePool(RESOURCE_DISTRIBUTION[layoutKey]);
  const shuffledResources = shuffle(state, resourcePool);
  const shuffledNumbers = shuffle(shuffledResources.state, NUMBER_DISTRIBUTION[layoutKey]);

  let numberIndex = 0;
  const board = layout.map((position, index): Hex => {
    const resource = shuffledResources.value[index] as Resource;
    const number = resource === "desert" || resource === "sea"
      ? null
      : shuffledNumbers.value[numberIndex++] as number;
    return { ...position, resource, number };
  });

  return {
    state: shuffledNumbers.state,
    value: board,
  };
}

export function getNeighbors(hex: Hex, board: readonly Hex[]): readonly Hex[] {
  const offsets = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]] as const;
  return offsets
    .map(([dq, dr]) =>
      board.find((candidate) => candidate.q === hex.q + dq && candidate.r === hex.r + dr)
    )
    .filter((candidate): candidate is Hex => candidate !== undefined);
}

export function summarizeBoard(board: readonly Hex[]): readonly string[] {
  return board.map((hex) => `${hex.row}:${hex.col}:${hex.resource}:${hex.number ?? "none"}`);
}

function createResourcePool(distribution: Partial<Record<Resource, number>>): readonly Resource[] {
  return Object.entries(distribution).flatMap(([resource, count]) =>
    Array.from({ length: count }, () => resource as Resource)
  );
}

export function pipsForNumber(number: number | null): number {
  return number === null ? 0 : NUMBER_PIPS[number] ?? 0;
}
