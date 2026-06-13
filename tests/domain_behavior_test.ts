import { strict as assert } from "node:assert";
import { createBoardView, getNeighbors, summarizeBoard } from "../src/domain/board.ts";
import { getGhostSettlements, getPortsForOptions } from "../src/domain/options.ts";
import { getGenerationOptions } from "../src/domain/options.ts";
import { createShareUrl, parseShareSearch } from "../src/domain/share-url.ts";
import { upsertSeedHistory } from "../src/domain/history.ts";
import {
  calculatePipBalance,
  countAdjacentHighNumbers,
  evaluateBoard,
} from "../src/domain/scoring.ts";
import { renderBoardSvg } from "../src/rendering/svg.ts";
import type { GenerationSelection, Hex, SeedHistoryEntry } from "../src/types.ts";

Deno.test("generateBoard_WhenGivenTheSameSeed_ReturnsTheSameBoard", () => {
  // Arrange
  const selection: GenerationSelection = { mode: "3-4", variant: "full-neutral", challenges: [] };

  // Act
  const first = createBoardView("repeatable-seed", selection);
  const second = createBoardView("repeatable-seed", selection);

  // Assert
  assert.deepEqual(first.board, second.board);
  assert.deepEqual(first.ports, second.ports);
  assert.deepEqual(first.difficulty, second.difficulty);
});

Deno.test("generateBoard_WhenUsingStandardLayout_UsesCatanResourceAndNumberCounts", () => {
  // Arrange
  const selection: GenerationSelection = { mode: "3-4", variant: "full-neutral", challenges: [] };

  // Act
  const view = createBoardView("distribution-seed", selection);
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
  const view = createBoardView("neighbor-seed", {
    mode: "3-4",
    variant: "full-neutral",
    challenges: [],
  });
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
  const view = createBoardView("pip-seed", {
    mode: "3-4",
    variant: "full-neutral",
    challenges: [],
  });

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
  });

  // Act
  const first = getPortsForOptions("port-seed", options);
  const second = getPortsForOptions("port-seed", options);

  // Assert
  assert.deepEqual(first, second);
  assert.equal(first.length, 6);
});

Deno.test("createShareUrl_WhenChallengesAreEmpty_RemovesChallengeParameter", () => {
  // Arrange
  const currentUrl =
    "https://example.test/?seed=old&mode=2&variant=compact-tight&challenges=scarce";

  // Act
  const url = createShareUrl(currentUrl, "fresh", {
    mode: "3-4",
    variant: "full-neutral",
    challenges: [],
  });

  // Assert
  assert.equal(url, "https://example.test/?seed=fresh&mode=3-4");
});

Deno.test("parseShareSearch_WhenUnknownOptionsArePresent_FallsBackToSafeDefaults", () => {
  // Arrange
  const search = "?seed=abc&mode=bogus&variant=unknown&challenges=scarce,bad,neutral";

  // Act
  const parsed = parseShareSearch(search);

  // Assert
  assert.deepEqual(parsed, {
    seed: "abc",
    selection: { mode: "3-4", variant: "full-neutral", challenges: ["scarce", "neutral"] },
  });
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

Deno.test("summarizeBoard_WhenUsingKnownSeed_MatchesDocumentationSnapshot", () => {
  // Arrange
  const view = createBoardView("docs-seed", {
    mode: "3-4",
    variant: "full-neutral",
    challenges: [],
  });

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

Deno.test("renderBoardSvg_WhenUsingCompactChallengeSeed_MatchesStableSnapshotShape", () => {
  // Arrange
  const view = createBoardView("docs-seed", {
    mode: "2",
    variant: "compact-tight",
    challenges: ["scarce", "harbors", "neutral"],
  });

  // Act
  const svg = renderBoardSvg({
    board: view.board,
    mode: view.selection.mode,
    variant: view.selection.variant,
    challenges: view.selection.challenges,
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
  assert.equal(svg.length, 21310);
  assert.ok(svg.startsWith('<svg id="board-svg" viewBox="0 0 856 788"'));
  assert.ok(svg.includes(">N</text>"));
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
