import type { BoardView, Challenge, GenerationSelection, Mode, Variant } from "../types.ts";
import { createBoardView } from "../domain/board.ts";

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

export function withBoard(state: AppState, seed: string): AppState {
  return {
    ...state,
    boardView: createBoardView(seed, state.selection),
  };
}

function normalizeSelection(selection: GenerationSelection): GenerationSelection {
  return {
    mode: selection.mode,
    variant: selection.variant,
    challenges: [...new Set(selection.challenges)],
  };
}
