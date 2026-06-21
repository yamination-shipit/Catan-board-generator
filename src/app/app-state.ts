import type {
  BalanceProfile,
  BoardView,
  Challenge,
  Expansion,
  GenerationSelection,
  Mode,
  RulePreset,
  Variant,
} from "../types.ts";
import { createBoardView } from "../domain/board.ts";
import { defaultSelection } from "../domain/options.ts";

export interface AppState {
  readonly selection: GenerationSelection;
  readonly boardView: BoardView | null;
}

export function initialState(selection: GenerationSelection): AppState {
  return {
    selection: normalizeSelection(selection),
    boardView: null,
  };
}

export function withMode(state: AppState, mode: Mode): AppState {
  return {
    ...state,
    selection: normalizeSelection({ ...state.selection, mode }),
  };
}

export function withVariant(state: AppState, variant: Variant): AppState {
  return {
    ...state,
    selection: normalizeSelection({ ...state.selection, variant }),
  };
}

export function withChallenges(state: AppState, challenges: readonly Challenge[]): AppState {
  return {
    ...state,
    selection: normalizeSelection({ ...state.selection, challenges: [...challenges] }),
  };
}

export function withExpansions(state: AppState, expansions: readonly Expansion[]): AppState {
  return {
    ...state,
    selection: normalizeSelection({ ...state.selection, expansions: [...expansions] }),
  };
}

export function withRulePreset(state: AppState, rulePreset: RulePreset): AppState {
  return {
    ...state,
    selection: normalizeSelection({ ...state.selection, rulePreset }),
  };
}

export function withBalanceProfile(state: AppState, balanceProfile: BalanceProfile): AppState {
  return {
    ...state,
    selection: normalizeSelection({ ...state.selection, balanceProfile }),
  };
}

export function withBoard(state: AppState, seed: string): AppState {
  return {
    ...state,
    boardView: createBoardView(seed, state.selection),
  };
}

function normalizeSelection(selection: GenerationSelection): GenerationSelection {
  const challenges = selection.mode === "2"
    ? selection.challenges
    : selection.challenges.filter((challenge) => challenge !== "neutral");

  return {
    mode: selection.mode,
    variant: selection.variant,
    challenges: [...new Set(challenges)],
    expansions: [...new Set(selection.expansions ?? defaultSelection.expansions)],
    rulePreset: selection.rulePreset ?? defaultSelection.rulePreset,
    balanceProfile: selection.balanceProfile ?? defaultSelection.balanceProfile,
  };
}
