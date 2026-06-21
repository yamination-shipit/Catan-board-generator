import type {
  BalanceProfile,
  BoardQualityNote,
  DifficultyRating,
  GenerationOptions,
  Hex,
  Mode,
  Port,
} from "../types.ts";
import { getGhostSettlements } from "./options.ts";
import { RESOURCES } from "./rules.ts";
import { calculatePipBalance, countAdjacentHighNumbers } from "./scoring.ts";
import { pipsForNumber } from "./board.ts";

export function createBoardQualityNotes(input: {
  readonly board: readonly Hex[];
  readonly mode: Mode;
  readonly options: GenerationOptions;
  readonly ports: readonly Port[];
  readonly difficulty: DifficultyRating;
}): readonly BoardQualityNote[] {
  const highNumberPairs = countAdjacentHighNumbers(input.board);
  const pipSpread = calculateResourcePipSpread(input.board);
  const neutralCount = getGhostSettlements(
    input.mode,
    input.options.variant,
    input.options.challenges,
  ).length;
  const notes: BoardQualityNote[] = [
    highNumberNote(highNumberPairs),
    pipSpreadNote(pipSpread, calculatePipBalance(input.board)),
    profileNote(input.options.balanceProfile, input.difficulty),
    harborNote(input.options, input.ports),
  ];

  if (input.options.scarceResource) {
    notes.push({
      label: `Scarce ${RESOURCES[input.options.scarceResource].name}`,
      detail:
        "The scarce-resource challenge rewards boards where that resource is harder to spike.",
      tone: "watch",
    });
  }

  if (neutralCount > 0) {
    notes.push({
      label: "Neutral pressure",
      detail: `${neutralCount} neutral settlement markers constrain early 2-player expansion.`,
      tone: neutralCount > 6 ? "hard" : "watch",
    });
  }

  return notes;
}

function highNumberNote(highNumberPairs: number): BoardQualityNote {
  if (highNumberPairs === 0) {
    return {
      label: "High numbers separated",
      detail: "No 6 or 8 tiles touch, so the hottest production spots are spread out.",
      tone: "good",
    };
  }
  return {
    label: "High-number cluster",
    detail: `${highNumberPairs} adjacent 6/8 pair${
      highNumberPairs === 1 ? "" : "s"
    } remain on this board.`,
    tone: highNumberPairs > 1 ? "hard" : "watch",
  };
}

function pipSpreadNote(spread: number, balance: number): BoardQualityNote {
  if (spread <= 5) {
    return {
      label: "Even resource pips",
      detail: `Resource production is tightly grouped with a ${spread}-pip spread.`,
      tone: "good",
    };
  }
  if (spread <= 9) {
    return {
      label: "Moderate pip swing",
      detail: `Resource production has a ${spread}-pip spread; watch the richest resource lanes.`,
      tone: balance > 0.35 ? "hard" : "watch",
    };
  }
  return {
    label: "Wide pip swing",
    detail:
      `Resource production has a ${spread}-pip spread, making trades and ports more important.`,
    tone: "hard",
  };
}

function profileNote(profile: BalanceProfile, difficulty: DifficultyRating): BoardQualityNote {
  if (profile === "strict") {
    return {
      label: "Strict balance",
      detail: `Extra candidates were searched; table difficulty is ${difficulty.level}/5.`,
      tone: "good",
    };
  }
  if (profile === "wild") {
    return {
      label: "Wild balance",
      detail: `Swingier boards are allowed; table difficulty is ${difficulty.level}/5.`,
      tone: difficulty.level >= 4 ? "hard" : "watch",
    };
  }
  return {
    label: "Classic balance",
    detail: `Uses the original generator profile; table difficulty is ${difficulty.level}/5.`,
    tone: difficulty.level >= 4 ? "hard" : "good",
  };
}

function harborNote(options: GenerationOptions, ports: readonly Port[]): BoardQualityNote {
  if (options.expansions.includes("seafarers")) {
    return {
      label: "Scenario harbors",
      detail: `${ports.length} Seafarers harbor tokens are shuffled from the seed.`,
      tone: "watch",
    };
  }
  if (options.challenges.includes("harbors")) {
    return {
      label: "Harbor scramble",
      detail: `${ports.length} harbor tokens are scrambled, changing port strategy from the seed.`,
      tone: "watch",
    };
  }
  return {
    label: "Fixed harbors",
    detail: `${ports.length} coastal harbor slots use the standard frame layout.`,
    tone: "good",
  };
}

function calculateResourcePipSpread(board: readonly Hex[]): number {
  const totals = board.reduce<Partial<Record<string, number>>>((accumulator, hex) => {
    if (hex.resource === "desert" || hex.resource === "sea") return accumulator;
    return {
      ...accumulator,
      [hex.resource]: (accumulator[hex.resource] ?? 0) + pipsForNumber(hex.number),
    };
  }, {});
  const values = Object.values(totals).filter((value): value is number => value !== undefined);
  if (values.length === 0) return 0;
  return Math.max(...values) - Math.min(...values);
}
