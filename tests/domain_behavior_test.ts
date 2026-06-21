import { strict as assert } from "node:assert";
import { createBoardView, getNeighbors, summarizeBoard } from "../src/domain/board.ts";
import { getGhostSettlements, getPortsForOptions } from "../src/domain/options.ts";
import { getGenerationOptions } from "../src/domain/options.ts";
import { createShareUrl, parseShareSearch } from "../src/domain/share-url.ts";
import { upsertSeedHistory } from "../src/domain/history.ts";
import { createBoardQualityNotes } from "../src/domain/quality.ts";
import { seedToHexColor } from "../src/domain/seed-color.ts";
import {
  calculatePipBalance,
  countAdjacentHighNumbers,
  evaluateBoard,
} from "../src/domain/scoring.ts";
import {
  COMPACT_PORTS,
  FIVE_SIX_PORTS,
  LAYOUTS,
  PORTS,
  RESOURCES,
  SEAFARERS_PORTS,
} from "../src/domain/rules.ts";
import { renderBoardSvg } from "../src/rendering/svg.ts";
import type { GenerationSelection, Hex, LayoutKey, Port, SeedHistoryEntry } from "../src/types.ts";

Deno.test("generateBoard_WhenGivenTheSameSeed_ReturnsTheSameBoard", () => {
  // Arrange
  const choice = selection();

  // Act
  const first = createBoardView("repeatable-seed", choice);
  const second = createBoardView("repeatable-seed", choice);

  // Assert
  assert.deepEqual(first.board, second.board);
  assert.deepEqual(first.ports, second.ports);
  assert.deepEqual(first.difficulty, second.difficulty);
});

Deno.test("generateBoard_WhenUsingStandardLayout_UsesCatanResourceAndNumberCounts", () => {
  // Arrange
  const choice = selection();

  // Act
  const view = createBoardView("distribution-seed", choice);
  const resources = countBy(view.board.map((hex) => hex.resource));
  const numbers = view.board.flatMap((hex) => hex.number === null ? [] : [hex.number]);

  // Assert
  assert.equal(view.board.length, 19);
  assert.deepEqual(resources, { brick: 3, desert: 1, ore: 3, sheep: 4, wheat: 4, wood: 4 });
  assert.equal(numbers.length, 18);
  assert.equal(view.board.find((hex) => hex.resource === "desert")?.number, null);
});

Deno.test("getNeighbors_WhenGivenCenterHex_ReturnsSixAdjacentHexes", () => {
  // Arrange
  const view = createBoardView("neighbor-seed", selection());
  const center = view.board.find((hex) => hex.q === 0 && hex.r === 0);
  assert.ok(center);

  // Act
  const neighbors = getNeighbors(center, view.board);

  // Assert
  assert.equal(neighbors.length, 6);
});

Deno.test("evaluateBoard_WhenHighNumbersTouch_ReducesTheScore", () => {
  // Arrange
  const baseBoard: readonly Hex[] = [
    { row: 0, col: 0, q: 0, r: 0, resource: "wood", number: 6 },
    { row: 0, col: 1, q: 1, r: 0, resource: "brick", number: 8 },
    { row: 1, col: 0, q: 0, r: 1, resource: "sheep", number: 5 },
    { row: 1, col: 1, q: -1, r: 1, resource: "wheat", number: 9 },
    { row: 2, col: 0, q: -1, r: 0, resource: "ore", number: 4 },
    { row: 2, col: 1, q: 0, r: -1, resource: "desert", number: null },
  ];
  const options = getGenerationOptions("score-seed", {
    mode: "3-4",
    variant: "full-neutral",
    challenges: [],
    expansions: [],
    rulePreset: "balanced-neutral",
    balanceProfile: "classic",
  });
  const separatedBoard = baseBoard.map((hex) =>
    hex.q === 1 && hex.r === 0 ? { ...hex, number: 4 } : hex
  );

  // Act
  const touchingScore = evaluateBoard(baseBoard, options);
  const separatedScore = evaluateBoard(separatedBoard, options);

  // Assert
  assert.equal(countAdjacentHighNumbers(baseBoard), 1);
  assert.ok(touchingScore < separatedScore);
});

Deno.test("calculatePipBalance_WhenPipsAreUneven_ReturnsPositivePressure", () => {
  // Arrange
  const view = createBoardView("pip-seed", selection());

  // Act
  const balance = calculatePipBalance(view.board);

  // Assert
  assert.ok(balance > 0);
  assert.ok(balance < 1);
});

Deno.test("getGhostSettlements_WhenCompactTightHasNeutralChallenge_AddsExtraNeutralPressure", () => {
  // Arrange
  const base = getGhostSettlements("2", "compact-tight", []);

  // Act
  const withChallenge = getGhostSettlements("2", "compact-tight", ["neutral"]);

  // Assert
  assert.equal(base.length, 6);
  assert.equal(withChallenge.length, 8);
});

Deno.test("getPortsForOptions_WhenHarborsChallengeIsEnabled_ShufflesDeterministically", () => {
  // Arrange
  const options = getGenerationOptions("port-seed", {
    mode: "2",
    variant: "compact-tight",
    challenges: ["harbors"],
    expansions: [],
    rulePreset: "balanced-neutral",
    balanceProfile: "classic",
  });

  // Act
  const first = getPortsForOptions("port-seed", options);
  const second = getPortsForOptions("port-seed", options);

  // Assert
  assert.deepEqual(first, second);
  assert.equal(first.length, 6);
});

Deno.test("getPortsForOptions_WhenUsingStandardBoard_UsesOfficialFrameHarborSlots", () => {
  // Arrange
  const options = getGenerationOptions("port-seed", selection());

  // Act
  const ports = getPortsForOptions("port-seed", options);

  // Assert
  assert.deepEqual(
    ports.map((port) => `${port.hexRow}:${port.hexCol}:${port.vertices.join("-")}`),
    [
      "0:0:5-0",
      "0:1:0-1",
      "0:2:1-2",
      "2:4:1-2",
      "3:3:2-3",
      "4:2:3-4",
      "4:1:2-3",
      "3:0:4-5",
      "1:0:5-0",
    ],
  );
  assert.deepEqual(ports, PORTS);
});

Deno.test("portFixtures_WhenRenderedOnAnyLayout_AttachOnlyToCoastalEdges", () => {
  // Arrange / Act / Assert
  assertPortsUseBoundaryEdges("3-4", PORTS);
  assertPortsUseBoundaryEdges("compact", COMPACT_PORTS);
  assertPortsUseBoundaryEdges("5-6", FIVE_SIX_PORTS);
  assertPortsUseBoundaryEdges("seafarers", SEAFARERS_PORTS);
});

Deno.test("getPortsForOptions_WhenUsingSeafarers_ShufflesHarborTokensBySeed", () => {
  // Arrange
  const selectionWithSeafarers = selection({ expansions: ["seafarers"] });
  const firstOptions = getGenerationOptions("seafarers-one", selectionWithSeafarers);
  const secondOptions = getGenerationOptions("seafarers-two", selectionWithSeafarers);

  // Act
  const first = getPortsForOptions("seafarers-one", firstOptions);
  const repeated = getPortsForOptions("seafarers-one", firstOptions);
  const second = getPortsForOptions("seafarers-two", secondOptions);

  // Assert
  assert.deepEqual(first, repeated);
  assert.deepEqual(portSlots(first), portSlots(SEAFARERS_PORTS));
  assert.deepEqual(portSlots(second), portSlots(SEAFARERS_PORTS));
  assert.notDeepEqual(first.map((port) => port.type), second.map((port) => port.type));
});

Deno.test("resources_WhenRenderingWheat_UsesGoldenTileColor", () => {
  // Arrange / Act / Assert
  assert.equal(RESOURCES.wheat.color, "#f4c430");
});

Deno.test("renderBoardSvg_WhenResourceColorsAreProvided_UsesColorOverrides", () => {
  // Arrange
  const board: readonly Hex[] = [
    { row: 0, col: 0, q: 0, r: 0, resource: "wheat", number: 5 },
  ];

  // Act
  const svg = renderBoardSvg({
    board,
    mode: "3-4",
    variant: "full-neutral",
    challenges: [],
    rulePreset: "balanced-neutral",
    ports: [],
    resourceColors: { wheat: "#123abc" },
  });

  // Assert
  assert.ok(svg.includes('fill="#123abc"'));
});

Deno.test("renderBoardSvg_WhenTileColorIsDark_UsesLightResourceText", () => {
  // Arrange
  const board: readonly Hex[] = [
    { row: 0, col: 0, q: 0, r: 0, resource: "wheat", number: 5 },
  ];

  // Act
  const svg = renderBoardSvg({
    board,
    mode: "3-4",
    variant: "full-neutral",
    challenges: [],
    rulePreset: "balanced-neutral",
    ports: [],
    resourceColors: { wheat: "#111111" },
  });

  // Assert
  assert.ok(svg.includes('fill="#f9fafb" font-weight="700">Wheat</text>'));
  assert.ok(svg.includes('fill="#f9fafb" dominant-baseline="middle">****</text>'));
});

Deno.test("renderBoardSvg_WhenTileColorIsLight_UsesDarkResourceText", () => {
  // Arrange
  const board: readonly Hex[] = [
    { row: 0, col: 0, q: 0, r: 0, resource: "wheat", number: 5 },
  ];

  // Act
  const svg = renderBoardSvg({
    board,
    mode: "3-4",
    variant: "full-neutral",
    challenges: [],
    rulePreset: "balanced-neutral",
    ports: [],
    resourceColors: { wheat: "#f4c430" },
  });

  // Assert
  assert.ok(svg.includes('fill="#111827" font-weight="700">Wheat</text>'));
  assert.ok(svg.includes('fill="#111827" dominant-baseline="middle">****</text>'));
});

Deno.test("createShareUrl_WhenChallengesAreEmpty_RemovesChallengeParameter", () => {
  // Arrange
  const currentUrl =
    "https://example.test/?seed=old&mode=2&variant=compact-tight&challenges=scarce";

  // Act
  const url = createShareUrl(
    currentUrl,
    "fresh",
    selection({
      mode: "3-4",
      variant: "full-neutral",
      challenges: [],
    }),
  );

  // Assert
  assert.equal(url, "https://example.test/?seed=fresh&mode=3-4");
});

Deno.test("createShareUrl_WhenExpansionsAreSelected_PreservesThemOutsideTheSeed", () => {
  // Arrange
  const currentUrl = "https://example.test/?seed=old";

  // Act
  const url = createShareUrl(currentUrl, "fresh", {
    mode: "2",
    variant: "compact-tight",
    challenges: [],
    expansions: ["seafarers", "cities-knights"],
    rulePreset: "long-game",
    balanceProfile: "strict",
  });

  // Assert
  assert.equal(
    url,
    "https://example.test/?seed=fresh&mode=2&variant=compact-tight&expansions=seafarers%2Ccities-knights&rules=long-game&balance=strict",
  );
});

Deno.test("parseShareSearch_WhenUnknownOptionsArePresent_FallsBackToSafeDefaults", () => {
  // Arrange
  const search =
    "?seed=abc&mode=bogus&variant=unknown&challenges=scarce,bad,neutral&expansions=seafarers,bad,seafarers&rules=unknown&balance=bad";

  // Act
  const parsed = parseShareSearch(search);

  // Assert
  assert.deepEqual(parsed, {
    seed: "abc",
    selection: {
      mode: "3-4",
      variant: "full-neutral",
      challenges: ["scarce", "neutral"],
      expansions: ["seafarers"],
      rulePreset: "balanced-neutral",
      balanceProfile: "classic",
    },
  });
});

Deno.test("createShareUrl_WhenBalanceIsClassic_RemovesStaleBalanceParameter", () => {
  // Arrange
  const currentUrl = "https://example.test/?seed=old&balance=wild";

  // Act
  const url = createShareUrl(currentUrl, "fresh", selection());

  // Assert
  assert.equal(url, "https://example.test/?seed=fresh&mode=3-4");
});

Deno.test("seedToHexColor_WhenSeedChanges_ReturnsStableHexColors", () => {
  // Arrange / Act
  const first = seedToHexColor("docs-seed");
  const repeated = seedToHexColor("docs-seed");
  const second = seedToHexColor("other-seed");

  // Assert
  assert.match(first, /^#[0-9a-f]{6}$/);
  assert.equal(first, repeated);
  assert.notEqual(first, second);
});

Deno.test("upsertSeedHistory_WhenDuplicateBoardChoiceIsSaved_MovesItToTheFront", () => {
  // Arrange
  const existing: readonly SeedHistoryEntry[] = [
    historyEntry("old", "3-4", []),
    historyEntry("same", "2", ["neutral"]),
  ];
  const replacement = historyEntry("same", "2", ["neutral"], "2026-06-13T13:00:00.000Z");

  // Act
  const history = upsertSeedHistory(existing, replacement);

  // Assert
  assert.equal(history.length, 2);
  assert.deepEqual(history[0], replacement);
});

Deno.test("upsertSeedHistory_WhenBalanceProfileDiffers_KeepsBothChoices", () => {
  // Arrange
  const existing: readonly SeedHistoryEntry[] = [historyEntry("same", "3-4", [])];
  const replacement: SeedHistoryEntry = {
    ...historyEntry("same", "3-4", [], "2026-06-13T13:00:00.000Z"),
    balanceProfile: "strict",
  };

  // Act
  const history = upsertSeedHistory(existing, replacement);

  // Assert
  assert.equal(history.length, 2);
  assert.equal(history[0]?.balanceProfile, "strict");
  assert.equal(history[1]?.balanceProfile, undefined);
});

Deno.test("summarizeBoard_WhenUsingKnownSeed_MatchesDocumentationSnapshot", () => {
  // Arrange
  const view = createBoardView("docs-seed", selection());

  // Act
  const summary = summarizeBoard(view.board);

  // Assert
  assert.deepEqual(summary, [
    "0:0:brick:9",
    "0:1:wood:8",
    "0:2:sheep:2",
    "1:0:sheep:11",
    "1:1:ore:4",
    "1:2:wood:11",
    "1:3:wheat:6",
    "2:0:sheep:8",
    "2:1:ore:3",
    "2:2:brick:12",
    "2:3:wheat:3",
    "2:4:wheat:10",
    "3:0:wood:5",
    "3:1:sheep:10",
    "3:2:wheat:9",
    "3:3:brick:4",
    "4:0:desert:none",
    "4:1:wood:6",
    "4:2:ore:5",
  ]);
  assert.deepEqual(view.difficulty, { level: 2, label: "Standard", score: 1.62 });
});

Deno.test("createBoardQualityNotes_WhenBoardIsGenerated_ExplainsBalanceSignals", () => {
  // Arrange
  const view = createBoardView("docs-seed", selection({ balanceProfile: "strict" }));

  // Act
  const notes = createBoardQualityNotes({
    board: view.board,
    mode: view.selection.mode,
    options: view.options,
    ports: view.ports,
    difficulty: view.difficulty,
  });

  // Assert
  assert.ok(notes.some((note) => note.label === "Strict balance"));
  assert.ok(notes.some((note) => note.label.includes("numbers")));
  assert.ok(notes.every((note) => note.detail.length > 0));
});

Deno.test("renderBoardSvg_WhenUsingCompactChallengeSeed_MatchesStableSnapshotShape", () => {
  // Arrange
  const view = createBoardView(
    "docs-seed",
    selection({
      mode: "2",
      variant: "compact-tight",
      challenges: ["scarce", "harbors", "neutral"],
    }),
  );

  // Act
  const svg = renderBoardSvg({
    board: view.board,
    mode: view.selection.mode,
    variant: view.selection.variant,
    challenges: view.selection.challenges,
    rulePreset: view.selection.rulePreset,
    ports: view.ports,
  });

  // Assert
  assert.deepEqual(summarizeBoard(view.board), [
    "0:0:sheep:5",
    "0:1:brick:10",
    "0:2:wheat:9",
    "1:0:wood:5",
    "1:1:sheep:8",
    "1:2:wheat:9",
    "1:3:sheep:4",
    "2:0:wood:4",
    "2:1:desert:none",
    "2:2:ore:11",
    "3:0:brick:3",
    "3:1:wood:10",
    "3:2:ore:6",
  ]);
  assert.ok(svg.includes('class="neutral-road"'));
  assert.ok(svg.startsWith('<svg id="board-svg" viewBox="0 0 856 788"'));
  assert.ok(svg.includes(">N</text>"));
});

Deno.test("createBoardView_WhenFiveSixPlayerExtensionIsSelected_UsesExpansionBoard", () => {
  // Arrange
  const choice = selection({
    expansions: ["five-six-players"],
  });

  // Act
  const view = createBoardView("docs-seed", choice);
  const resources = countBy(view.board.map((hex) => hex.resource));
  const numbers = view.board.flatMap((hex) => hex.number === null ? [] : [hex.number]);

  // Assert
  assert.equal(view.options.layoutKey, "5-6");
  assert.equal(view.board.length, 30);
  assert.deepEqual(resources, { brick: 5, desert: 2, ore: 5, sheep: 6, wheat: 6, wood: 6 });
  assert.equal(numbers.length, 28);
  assert.deepEqual(view.ports, FIVE_SIX_PORTS);
});

Deno.test("createBoardView_WhenSeafarersIsSelected_UsesSeaAndGoldScenarioBoard", () => {
  // Arrange
  const choice = selection({
    expansions: ["seafarers"],
  });

  // Act
  const view = createBoardView("docs-seed", choice);
  const resources = countBy(view.board.map((hex) => hex.resource));
  const seaNumbers = view.board.filter((hex) => hex.resource === "sea").map((hex) => hex.number);
  const goldNumbers = view.board.filter((hex) => hex.resource === "gold").map((hex) => hex.number);

  // Assert
  assert.equal(view.options.layoutKey, "seafarers");
  assert.equal(view.board.length, 37);
  assert.deepEqual(resources, {
    brick: 5,
    desert: 3,
    gold: 2,
    ore: 5,
    sea: 7,
    sheep: 5,
    wheat: 5,
    wood: 5,
  });
  assert.deepEqual(seaNumbers, Array.from({ length: 7 }, () => null));
  assert.equal(goldNumbers.length, 2);
  assert.ok(goldNumbers.every((number) => number !== null));
  assert.deepEqual(portSlots(view.ports), portSlots(SEAFARERS_PORTS));
  assert.notDeepEqual(view.ports, SEAFARERS_PORTS);
});

Deno.test("createBoardView_WhenCitiesKnightsIsSelected_LeavesTerrainGenerationToBaseBoard", () => {
  // Arrange
  const base = createBoardView("docs-seed", selection());

  // Act
  const citiesKnights = createBoardView(
    "docs-seed",
    selection({
      expansions: ["cities-knights"],
    }),
  );

  // Assert
  assert.equal(citiesKnights.options.layoutKey, "3-4");
  assert.deepEqual(summarizeBoard(citiesKnights.board), summarizeBoard(base.board));
  assert.deepEqual(citiesKnights.ports, base.ports);
});

function countBy(values: readonly string[]): Record<string, number> {
  return Object.fromEntries(
    Object.entries(
      values.reduce<Record<string, number>>((counts, value) => ({
        ...counts,
        [value]: (counts[value] ?? 0) + 1,
      }), {}),
    ).sort(([left], [right]) => left.localeCompare(right)),
  );
}

function assertPortsUseBoundaryEdges(layoutKey: LayoutKey, ports: readonly Port[]): void {
  const layout = LAYOUTS[layoutKey];
  const coordinates = new Set(layout.map((hex) => `${hex.q},${hex.r}`));
  ports.forEach((port) => {
    const hex = layout.find((candidate) =>
      candidate.row === port.hexRow && candidate.col === port.hexCol
    );
    assert.ok(hex, `expected port ${port.hexRow}:${port.hexCol} to reference a layout hex`);
    const direction = edgeDirections[port.vertices[0]];
    assert.ok(direction, `expected port vertices ${port.vertices.join("-")} to describe an edge`);
    assert.equal(
      coordinates.has(`${hex.q + direction.q},${hex.r + direction.r}`),
      false,
      `expected port ${port.hexRow}:${port.hexCol}:${port.vertices.join("-")} to be coastal`,
    );
  });
}

function portSlots(ports: readonly Port[]): readonly string[] {
  return ports.map((port) => `${port.hexRow}:${port.hexCol}:${port.vertices.join("-")}`);
}

function selection(overrides: Partial<GenerationSelection> = {}): GenerationSelection {
  return {
    mode: "3-4",
    variant: "full-neutral",
    challenges: [],
    expansions: [],
    rulePreset: "balanced-neutral",
    balanceProfile: "classic",
    ...overrides,
  };
}

const edgeDirections: readonly { readonly q: number; readonly r: number }[] = [
  { q: 1, r: -1 },
  { q: 1, r: 0 },
  { q: 0, r: 1 },
  { q: -1, r: 1 },
  { q: -1, r: 0 },
  { q: 0, r: -1 },
];

function historyEntry(
  seed: string,
  mode: "3-4" | "2",
  challenges: readonly ("neutral" | "scarce" | "harbors")[],
  createdAt = "2026-06-13T12:00:00.000Z",
): SeedHistoryEntry {
  return {
    seed,
    mode,
    variant: mode === "2" ? "compact-tight" : "full-neutral",
    challenges,
    difficulty: null,
    createdAt,
  };
}
