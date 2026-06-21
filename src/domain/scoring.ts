import type { DifficultyRating, GenerationOptions, Hex, Mode, Port, Resource } from "../types.ts";
import { getNeighbors, pipsForNumber } from "./board.ts";
import { getGhostSettlements } from "./options.ts";

export function evaluateBoard(board: readonly Hex[], options: GenerationOptions): number {
  let score = 1;
  const weights = scoreWeightsForProfile(options);
  score -= countAdjacentHighNumbers(board) * weights.highNumbers;
  score -= calculatePipBalance(board) * weights.pipBalance;
  score += calculateResourceDiversity(board) * weights.diversity;

  if (options.scarceResource) {
    score += calculateScarcityChallengeScore(board, options.scarceResource) * weights.scarcity;
  }

  return score;
}

function scoreWeightsForProfile(options: GenerationOptions): {
  readonly highNumbers: number;
  readonly pipBalance: number;
  readonly diversity: number;
  readonly scarcity: number;
} {
  if (options.balanceProfile === "strict") {
    return { highNumbers: 0.42, pipBalance: 0.32, diversity: 0.14, scarcity: 0.26 };
  }
  if (options.balanceProfile === "wild") {
    return { highNumbers: 0.18, pipBalance: 0.1, diversity: 0.05, scarcity: 0.12 };
  }
  return { highNumbers: 0.3, pipBalance: 0.2, diversity: 0.1, scarcity: 0.2 };
}

export function calculateDifficultyRating(
  board: readonly Hex[],
  mode: Mode,
  options: GenerationOptions,
  ports: readonly Port[],
): DifficultyRating {
  const pipBalance = calculatePipBalance(board);
  const highNumberPairs = countAdjacentHighNumbers(board);
  const neutralCount = getGhostSettlements(mode, options.variant, options.challenges).length;
  const scarcePressure = options.scarceResource
    ? Math.max(0, calculateScarcityChallengeScore(board, options.scarceResource))
    : 0;
  const portPressure = Math.max(0, 9 - ports.length) * 0.18;
  const challengePressure = options.challenges.length * 0.22;
  const compactPressure = options.compact ? 0.65 : 0;
  const neutralPressure = neutralCount * (options.compact ? 0.12 : 0.08);
  const rawScore = 1 +
    pipBalance * 2.4 +
    highNumberPairs * 0.45 +
    scarcePressure * 0.65 +
    portPressure +
    challengePressure +
    compactPressure +
    neutralPressure;
  const level = Math.max(1, Math.min(5, Math.round(rawScore))) as 1 | 2 | 3 | 4 | 5;
  const labels: Record<DifficultyRating["level"], DifficultyRating["label"]> = {
    1: "Easy",
    2: "Standard",
    3: "Tricky",
    4: "Hard",
    5: "Brutal",
  };
  return {
    level,
    label: labels[level],
    score: Number(rawScore.toFixed(2)),
  };
}

export function countAdjacentHighNumbers(board: readonly Hex[]): number {
  const highNumbers = [6, 8];
  const count = board.reduce((total, hex) => {
    if (!highNumbers.includes(hex.number ?? 0)) return total;
    return total +
      getNeighbors(hex, board).filter((neighbor) => highNumbers.includes(neighbor.number ?? 0))
        .length;
  }, 0);
  return count / 2;
}

export function calculatePipBalance(board: readonly Hex[]): number {
  const resourcePips = board.reduce<Record<string, number>>((totals, hex) => {
    if (hex.resource === "desert" || hex.resource === "sea") return totals;
    return {
      ...totals,
      [hex.resource]: (totals[hex.resource] ?? 0) + pipsForNumber(hex.number),
    };
  }, {});
  const values = Object.values(resourcePips);
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - average) ** 2, 0) / values.length;
  return Math.sqrt(variance) / average;
}

export function calculateResourceDiversity(board: readonly Hex[]): number {
  const land = board.filter((hex) => hex.resource !== "sea");
  const total = land.reduce((sum, hex) => {
    const uniqueResources = new Set(
      getNeighbors(hex, board)
        .filter((neighbor) => neighbor.resource !== "sea")
        .map((neighbor) => neighbor.resource),
    );
    return sum + uniqueResources.size;
  }, 0);
  return total / land.length / 6;
}

export function calculateScarcityChallengeScore(board: readonly Hex[], resource: Resource): number {
  const resourceHexes = board.filter((hex) => hex.resource === resource);
  const resourcePips = resourceHexes.reduce((sum, hex) => sum + pipsForNumber(hex.number), 0);
  const hasHighNumber = resourceHexes.some((hex) => hex.number === 6 || hex.number === 8);
  return (hasHighNumber ? -0.5 : 0.5) + Math.max(0, (11 - resourcePips) / 11);
}
