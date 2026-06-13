import type {
  Challenge,
  Expansion,
  GhostSettlement,
  HexLayout,
  LayoutKey,
  Port,
  Resource,
  ResourceDefinition,
  RulePreset,
  Variant,
} from "../types.ts";

export const RESOURCES: Record<Resource, ResourceDefinition> = {
  wood: { name: "Wood", color: "#228b22", shortLabel: "Wood" },
  brick: { name: "Brick", color: "#b22222", shortLabel: "Brick" },
  sheep: { name: "Sheep", color: "#8fce72", shortLabel: "Sheep" },
  wheat: { name: "Wheat", color: "#f4c430", shortLabel: "Wheat" },
  ore: { name: "Ore", color: "#696969", shortLabel: "Ore" },
  desert: { name: "Desert", color: "#deb887", shortLabel: "Desert" },
};

export const NUMBER_PIPS: Record<number, number> = {
  2: 1,
  3: 2,
  4: 3,
  5: 4,
  6: 5,
  8: 5,
  9: 4,
  10: 3,
  11: 2,
  12: 1,
};

export const STANDARD_LAYOUT: readonly HexLayout[] = [
  { row: 0, col: 0, q: 0, r: -2 },
  { row: 0, col: 1, q: 1, r: -2 },
  { row: 0, col: 2, q: 2, r: -2 },
  { row: 1, col: 0, q: -1, r: -1 },
  { row: 1, col: 1, q: 0, r: -1 },
  { row: 1, col: 2, q: 1, r: -1 },
  { row: 1, col: 3, q: 2, r: -1 },
  { row: 2, col: 0, q: -2, r: 0 },
  { row: 2, col: 1, q: -1, r: 0 },
  { row: 2, col: 2, q: 0, r: 0 },
  { row: 2, col: 3, q: 1, r: 0 },
  { row: 2, col: 4, q: 2, r: 0 },
  { row: 3, col: 0, q: -2, r: 1 },
  { row: 3, col: 1, q: -1, r: 1 },
  { row: 3, col: 2, q: 0, r: 1 },
  { row: 3, col: 3, q: 1, r: 1 },
  { row: 4, col: 0, q: -2, r: 2 },
  { row: 4, col: 1, q: -1, r: 2 },
  { row: 4, col: 2, q: 0, r: 2 },
];

export const COMPACT_LAYOUT: readonly HexLayout[] = [
  { row: 0, col: 0, q: 0, r: -2 },
  { row: 0, col: 1, q: 1, r: -2 },
  { row: 0, col: 2, q: 2, r: -2 },
  { row: 1, col: 0, q: -1, r: -1 },
  { row: 1, col: 1, q: 0, r: -1 },
  { row: 1, col: 2, q: 1, r: -1 },
  { row: 1, col: 3, q: 2, r: -1 },
  { row: 2, col: 0, q: -1, r: 0 },
  { row: 2, col: 1, q: 0, r: 0 },
  { row: 2, col: 2, q: 1, r: 0 },
  { row: 3, col: 0, q: -2, r: 1 },
  { row: 3, col: 1, q: -1, r: 1 },
  { row: 3, col: 2, q: 0, r: 1 },
];

export const LAYOUTS: Record<LayoutKey, readonly HexLayout[]> = {
  "3-4": STANDARD_LAYOUT,
  "2": STANDARD_LAYOUT,
  compact: COMPACT_LAYOUT,
};

export const RESOURCE_DISTRIBUTION: Record<LayoutKey, Record<Resource, number>> = {
  "3-4": { wood: 4, brick: 3, sheep: 4, wheat: 4, ore: 3, desert: 1 },
  "2": { wood: 4, brick: 3, sheep: 4, wheat: 4, ore: 3, desert: 1 },
  compact: { wood: 3, brick: 2, sheep: 3, wheat: 2, ore: 2, desert: 1 },
};

export const NUMBER_DISTRIBUTION: Record<LayoutKey, readonly number[]> = {
  "3-4": [2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12],
  "2": [2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12],
  compact: [3, 4, 4, 5, 5, 6, 8, 9, 9, 10, 10, 11],
};

export const VARIANT_NAMES: Record<Variant, string> = {
  "full-neutral": "Full board + neutral settlements",
  "full-open": "Full board, no neutral settlements",
  "full-tight": "Full board + extra neutral pressure",
  "compact-duel": "Compact duel",
  "compact-tight": "Compact tight",
};

export const VARIANT_DESCRIPTIONS: Record<Variant, string> = {
  "full-neutral": "Use all 19 hexes and place 8 neutral settlements before player setup.",
  "full-open": "Use all 19 hexes with standard starting placement and no neutral blockers.",
  "full-tight": "Use all 19 hexes and place 12 neutral settlements for a tighter map.",
  "compact-duel": "Use a smaller 13-hex island with fewer ports for faster 2-player games.",
  "compact-tight":
    "Use the compact island with neutral blockers to create early expansion pressure.",
};

export const CHALLENGE_NAMES: Record<Challenge, string> = {
  scarce: "Scarce resources",
  harbors: "Harbor scramble",
  neutral: "Neutral pressure",
};

export const EXPANSION_NAMES: Record<Expansion, string> = {
  "five-six-players": "5-6 player extension",
  seafarers: "Seafarers",
  "cities-knights": "Cities & Knights",
};

export const RULE_PRESET_NAMES: Record<RulePreset, string> = {
  "balanced-neutral": "Balanced neutral setup",
  "open-duel": "Open duel",
  "long-game": "Long game",
};

export const RULE_PRESETS: Record<
  RulePreset,
  {
    readonly startingSettlements: number;
    readonly startingRoads: number;
    readonly neutralRoads: boolean;
    readonly victoryPoints: number;
    readonly summary: string;
  }
> = {
  "balanced-neutral": {
    startingSettlements: 2,
    startingRoads: 2,
    neutralRoads: true,
    victoryPoints: 10,
    summary: "Use neutral blockers and neutral roads where the board marks them.",
  },
  "open-duel": {
    startingSettlements: 2,
    startingRoads: 2,
    neutralRoads: false,
    victoryPoints: 10,
    summary: "Use the selected board with normal starting placement and no neutral roads.",
  },
  "long-game": {
    startingSettlements: 2,
    startingRoads: 2,
    neutralRoads: true,
    victoryPoints: 12,
    summary: "Use neutral blockers and neutral roads, then play to a longer victory target.",
  },
};

export const PORTS: readonly Port[] = [
  { type: "3:1", hexRow: 0, hexCol: 0, vertices: [5, 0], label: "3:1", shortLabel: "?" },
  { type: "wheat", hexRow: 0, hexCol: 1, vertices: [5, 0], label: "2:1", shortLabel: "Wheat" },
  { type: "ore", hexRow: 0, hexCol: 2, vertices: [1, 2], label: "2:1", shortLabel: "Ore" },
  { type: "sheep", hexRow: 1, hexCol: 3, vertices: [1, 2], label: "2:1", shortLabel: "Sheep" },
  { type: "3:1", hexRow: 2, hexCol: 4, vertices: [1, 2], label: "3:1", shortLabel: "?" },
  { type: "brick", hexRow: 3, hexCol: 3, vertices: [2, 3], label: "2:1", shortLabel: "Brick" },
  { type: "wood", hexRow: 4, hexCol: 2, vertices: [2, 3], label: "2:1", shortLabel: "Wood" },
  { type: "3:1", hexRow: 4, hexCol: 0, vertices: [3, 4], label: "3:1", shortLabel: "?" },
  { type: "3:1", hexRow: 2, hexCol: 0, vertices: [4, 5], label: "3:1", shortLabel: "?" },
];

export const COMPACT_PORTS: readonly Port[] = [
  { type: "3:1", hexRow: 0, hexCol: 0, vertices: [5, 0], label: "3:1", shortLabel: "?" },
  { type: "wheat", hexRow: 0, hexCol: 2, vertices: [1, 2], label: "2:1", shortLabel: "Wheat" },
  { type: "ore", hexRow: 1, hexCol: 3, vertices: [1, 2], label: "2:1", shortLabel: "Ore" },
  { type: "sheep", hexRow: 3, hexCol: 2, vertices: [2, 3], label: "2:1", shortLabel: "Sheep" },
  { type: "brick", hexRow: 3, hexCol: 0, vertices: [3, 4], label: "2:1", shortLabel: "Brick" },
  { type: "wood", hexRow: 1, hexCol: 0, vertices: [4, 5], label: "2:1", shortLabel: "Wood" },
];

export const GHOST_SETTLEMENTS: readonly GhostSettlement[] = [
  { hexRow: 0, hexCol: 0, vertex: 5 },
  { hexRow: 0, hexCol: 2, vertex: 1 },
  { hexRow: 2, hexCol: 0, vertex: 4 },
  { hexRow: 2, hexCol: 4, vertex: 2 },
  { hexRow: 4, hexCol: 0, vertex: 4 },
  { hexRow: 4, hexCol: 2, vertex: 2 },
  { hexRow: 1, hexCol: 1, vertex: 0 },
  { hexRow: 3, hexCol: 2, vertex: 3 },
];

export const EXTRA_GHOST_SETTLEMENTS: readonly GhostSettlement[] = [
  { hexRow: 1, hexCol: 0, vertex: 5 },
  { hexRow: 1, hexCol: 3, vertex: 2 },
  { hexRow: 3, hexCol: 0, vertex: 4 },
  { hexRow: 3, hexCol: 3, vertex: 2 },
];

export const COMPACT_GHOST_SETTLEMENTS: readonly GhostSettlement[] = [
  { hexRow: 0, hexCol: 0, vertex: 5 },
  { hexRow: 0, hexCol: 2, vertex: 1 },
  { hexRow: 1, hexCol: 0, vertex: 4 },
  { hexRow: 1, hexCol: 3, vertex: 2 },
  { hexRow: 3, hexCol: 0, vertex: 4 },
  { hexRow: 3, hexCol: 2, vertex: 2 },
];

export const COMPACT_EXTRA_GHOST_SETTLEMENTS: readonly GhostSettlement[] = [
  { hexRow: 1, hexCol: 1, vertex: 0 },
  { hexRow: 2, hexCol: 1, vertex: 3 },
];
