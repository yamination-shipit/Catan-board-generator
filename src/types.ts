export type Resource = "wood" | "brick" | "sheep" | "wheat" | "ore" | "desert" | "gold" | "sea";
export type Mode = "3-4" | "2";
export type LayoutKey = Mode | "compact" | "5-6" | "seafarers";
export type Challenge = "scarce" | "harbors" | "neutral";
export type Expansion = "five-six-players" | "seafarers" | "cities-knights";
export type RulePreset = "balanced-neutral" | "open-duel" | "long-game";
export type Variant =
  | "full-neutral"
  | "full-open"
  | "full-tight"
  | "compact-duel"
  | "compact-tight";

export interface ResourceDefinition {
  readonly name: string;
  readonly color: string;
  readonly shortLabel: string;
}

export interface HexLayout {
  readonly row: number;
  readonly col: number;
  readonly q: number;
  readonly r: number;
}

export interface Hex extends HexLayout {
  readonly resource: Resource;
  readonly number: number | null;
}

export interface GhostSettlement {
  readonly hexRow: number;
  readonly hexCol: number;
  readonly vertex: number;
}

export interface Port {
  readonly type: Resource | "3:1";
  readonly hexRow: number;
  readonly hexCol: number;
  readonly vertices: readonly [number, number];
  readonly label: "2:1" | "3:1";
  readonly shortLabel: string;
}

export interface GenerationSelection {
  readonly mode: Mode;
  readonly variant: Variant;
  readonly challenges: readonly Challenge[];
  readonly expansions: readonly Expansion[];
  readonly rulePreset: RulePreset;
}

export interface GenerationOptions {
  readonly layoutKey: LayoutKey;
  readonly compact: boolean;
  readonly variant: Variant;
  readonly challenges: readonly Challenge[];
  readonly expansions: readonly Expansion[];
  readonly rulePreset: RulePreset;
  readonly scarceResource: Resource | null;
}

export interface DifficultyRating {
  readonly level: 1 | 2 | 3 | 4 | 5;
  readonly label: "Easy" | "Standard" | "Tricky" | "Hard" | "Brutal";
  readonly score: number;
}

export interface BoardView {
  readonly seed: string;
  readonly selection: GenerationSelection;
  readonly options: GenerationOptions;
  readonly board: readonly Hex[];
  readonly ports: readonly Port[];
  readonly difficulty: DifficultyRating;
}

export interface SeedHistoryEntry {
  readonly seed: string;
  readonly mode: Mode;
  readonly variant: Variant;
  readonly challenges: readonly Challenge[];
  readonly expansions?: readonly Expansion[];
  readonly rulePreset?: RulePreset;
  readonly difficulty: DifficultyRating | null;
  readonly createdAt: string;
}

export interface VersionInfo {
  readonly version: string;
  readonly gitSha: string;
  readonly gitFullSha: string;
  readonly releaseUrl: string;
  readonly commitUrl: string;
}
