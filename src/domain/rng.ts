export interface RandomState {
  readonly seed: number;
}

export interface RandomResult {
  readonly state: RandomState;
  readonly value: number;
}

export function createRandomState(seed: number): RandomState {
  return { seed: Math.abs(seed) % 233280 };
}

export function nextRandom(state: RandomState): RandomResult {
  const seed = (state.seed * 9301 + 49297) % 233280;
  return {
    state: { seed },
    value: seed / 233280,
  };
}

export function nextInt(
  state: RandomState,
  min: number,
  max: number,
): { readonly state: RandomState; readonly value: number } {
  const result = nextRandom(state);
  return {
    state: result.state,
    value: Math.floor(result.value * (max - min + 1)) + min,
  };
}

export function shuffle<T>(
  state: RandomState,
  items: readonly T[],
): { readonly state: RandomState; readonly value: readonly T[] } {
  let nextState = state;
  const shuffled = [...items];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const result = nextInt(nextState, 0, i);
    nextState = result.state;
    const current = shuffled[i] as T;
    const target = shuffled[result.value] as T;
    shuffled[i] = target;
    shuffled[result.value] = current;
  }

  return { state: nextState, value: shuffled };
}

export function hashSeed(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index++) {
    hash = ((hash << 5) - hash) + value.charCodeAt(index);
    hash = hash & hash;
  }
  return Math.abs(hash);
}
