import type { AppState } from "./app/app-state.ts";
import {
  initialState,
  withBoard,
  withChallenges,
  withExpansions,
  withMode,
  withRulePreset,
  withVariant,
} from "./app/app-state.ts";
import { createRandomSeed } from "./app/seed.ts";
import {
  CHALLENGE_NAMES,
  EXPANSION_NAMES,
  RESOURCES,
  RULE_PRESET_NAMES,
  RULE_PRESETS,
  VARIANT_DESCRIPTIONS,
  VARIANT_NAMES,
} from "./domain/rules.ts";
import { pipsForNumber } from "./domain/board.ts";
import { getGhostSettlements } from "./domain/options.ts";
import { createShareUrl, parseShareSearch } from "./domain/share-url.ts";
import { upsertSeedHistory } from "./domain/history.ts";
import { renderBoardSvg } from "./rendering/svg.ts";
import type {
  Challenge,
  Expansion,
  Mode,
  Resource,
  RulePreset,
  SeedHistoryEntry,
  Variant,
} from "./types.ts";

const HISTORY_KEY = "catan-board-seed-history";
const PANEL_STATE_KEY = "catan-board-panel-state";
const THEME_KEY = "catan-board-theme";
const sections = ["setup", "seed", "rules", "history", "stats"] as const;
const resourceOrder: readonly Resource[] = [
  "wood",
  "brick",
  "sheep",
  "wheat",
  "ore",
  "gold",
  "desert",
  "sea",
];

let state: AppState;
let seedHistory: readonly SeedHistoryEntry[] = [];
let collapsedSections: Record<string, boolean> = {};
let selectedResource: Resource | null = null;

document.addEventListener("DOMContentLoaded", () => {
  const parsed = parseShareSearch(globalThis.location.search);
  state = initialState(parsed.selection);
  seedHistory = loadJson(HISTORY_KEY, []);
  collapsedSections = loadJson(PANEL_STATE_KEY, {});
  applyStoredTheme();
  bindEvents();
  syncControlsFromState();
  renderPanelState();
  renderSeedHistory();

  if (parsed.seed) {
    generateBoard(parsed.seed, true);
  } else {
    generateBoard(createRandomSeed(), false);
  }
});

function bindEvents(): void {
  byId("mode-34").addEventListener("click", () => switchMode("3-4"));
  byId("mode-2").addEventListener("click", () => switchMode("2"));
  byId("generate-btn").addEventListener("click", () => generateBoard(createRandomSeed(), true));
  byId("load-seed-btn").addEventListener("click", loadSeedFromInput);
  byId("copy-seed-btn").addEventListener(
    "click",
    () => copyText(state.boardView?.seed ?? "", "Seed copied."),
  );
  byId("copy-url-btn").addEventListener("click", copyCurrentUrl);
  byId("fullscreen-btn").addEventListener("click", toggleFullscreen);
  byId("board-reset-zoom-btn").addEventListener("click", resetZoom);
  byId("theme-toggle-btn").addEventListener("click", toggleTheme);
  byId("collapse-all-btn").addEventListener("click", toggleAllSections);
  byId("share-history-btn").addEventListener("click", copySeedHistory);
  byId("clear-history-btn").addEventListener("click", clearSeedHistory);
  byId("variant-select").addEventListener("change", () => {
    state = withVariant(state, selectValue("variant-select") as Variant);
    refreshCurrentBoard();
  });
  byId("rule-preset-select").addEventListener("change", () => {
    state = withRulePreset(state, selectValue("rule-preset-select") as RulePreset);
    refreshCurrentBoard();
  });
  ["challenge-scarce", "challenge-harbors", "challenge-neutral"].forEach((id) => {
    byId(id).addEventListener("change", () => {
      state = withChallenges(state, readChallenges());
      refreshCurrentBoard();
    });
  });
  ["expansion-five-six-players", "expansion-seafarers", "expansion-cities-knights"].forEach(
    (id) => {
      byId(id).addEventListener("change", () => {
        state = withExpansions(state, readExpansions());
        refreshCurrentBoard();
      });
    },
  );
  document.querySelectorAll<HTMLElement>("[data-section-toggle]").forEach((button) => {
    button.addEventListener("click", () => toggleSection(button.dataset.sectionToggle ?? ""));
  });
  document.addEventListener("fullscreenchange", updateFullscreenButton);
}

function switchMode(mode: Mode): void {
  state = withMode(state, mode);
  if (mode === "3-4" && state.selection.challenges.includes("neutral")) {
    state = withChallenges(
      state,
      state.selection.challenges.filter((challenge) => challenge !== "neutral"),
    );
  }
  syncControlsFromState();
  refreshCurrentBoard();
}

function loadSeedFromInput(): void {
  const seed = inputValue("seed-input").trim();
  if (!seed) {
    showNotification("Enter a seed to load, or use New Board.");
    return;
  }
  generateBoard(seed, true);
}

function refreshCurrentBoard(): void {
  if (!state.boardView) return;
  generateBoard(state.boardView.seed, true);
}

function generateBoard(seed: string, saveHistory: boolean): void {
  state = withBoard(state, seed);
  if (!state.boardView) return;
  const view = state.boardView;
  setInputValue("seed-input", view.seed);
  renderBoard(view);
  renderStats(view.board);
  renderDifficulty();
  renderCurrentSeed();
  renderRulesAndSetup();
  globalThis.history.pushState(
    {},
    "",
    createShareUrl(globalThis.location.href, view.seed, view.selection),
  );

  if (saveHistory) {
    seedHistory = upsertSeedHistory(seedHistory, {
      seed: view.seed,
      mode: view.selection.mode,
      variant: view.selection.variant,
      challenges: view.selection.challenges,
      expansions: view.selection.expansions,
      rulePreset: view.selection.rulePreset,
      difficulty: view.difficulty,
      createdAt: new Date().toISOString(),
    });
    saveJson(HISTORY_KEY, seedHistory);
    renderSeedHistory();
  }
}

function renderBoard(view = state.boardView): void {
  if (!view) return;
  byId("board-container").innerHTML = `
    <div class="zoom-wrapper" id="zoom-wrapper">
      <div class="zoom-controls">
        <button id="zoom-in-btn" title="Zoom in">+</button>
        <button id="zoom-out-btn" title="Zoom out">-</button>
        <button id="zoom-reset-btn" title="Reset zoom">Reset</button>
      </div>
      <div id="zoom-content">
        ${
    renderBoardSvg({
      board: view.board,
      mode: view.selection.mode,
      variant: view.selection.variant,
      challenges: view.selection.challenges,
      rulePreset: view.selection.rulePreset,
      ports: view.ports,
    })
  }
      </div>
    </div>
  `;
  initZoom();
  applyResourceHighlight();
}

function renderStats(board = state.boardView?.board ?? []): void {
  const stats = board.reduce<Partial<Record<Resource, { count: number; pips: number }>>>(
    (totals, hex) => ({
      ...totals,
      [hex.resource]: {
        count: (totals[hex.resource]?.count ?? 0) + 1,
        pips: (totals[hex.resource]?.pips ?? 0) + pipsForNumber(hex.number),
      },
    }),
    {},
  );

  byId("stats").innerHTML = resourceOrder
    .filter((resource) => stats[resource])
    .map((resource) => {
      const definition = RESOURCES[resource];
      const totals = stats[resource];
      if (!totals) return "";
      return `<button class="stat-tile" type="button" data-resource="${resource}">
        <strong>${definition.name}</strong>
        <span>${totals.count}x</span>
        <small>${totals.pips} pips</small>
      </button>`;
    }).join("");
  byId("stats").querySelectorAll<HTMLElement>("[data-resource]").forEach((tile) => {
    tile.addEventListener(
      "click",
      () => toggleResourceHighlight(tile.dataset.resource as Resource),
    );
  });
  applyResourceHighlight();
}

function renderDifficulty(): void {
  const difficulty = state.boardView?.difficulty;
  byId("difficulty-rating").textContent = difficulty
    ? `Difficulty: ${difficulty.level}/5 ${difficulty.label}`
    : "Difficulty: --";
}

function renderCurrentSeed(): void {
  const view = state.boardView;
  if (!view) return;
  const parts = [
    `Current Seed: ${view.seed}`,
    `Mode: ${view.selection.mode === "2" ? "2 Players" : "3-4 Players"}`,
  ];
  if (view.selection.mode === "2") parts.push(`Variant: ${VARIANT_NAMES[view.selection.variant]}`);
  if (view.selection.challenges.length) {
    parts.push(
      `Challenges: ${
        view.selection.challenges.map((challenge) => CHALLENGE_NAMES[challenge]).join(", ")
      }`,
    );
  }
  if (view.selection.expansions.length) {
    parts.push(
      `Expansions: ${
        view.selection.expansions.map((expansion) => EXPANSION_NAMES[expansion]).join(", ")
      }`,
    );
  }
  if (view.selection.mode === "2") {
    parts.push(`Rules: ${RULE_PRESET_NAMES[view.selection.rulePreset]}`);
  }
  if (view.options.scarceResource) {
    parts.push(`Scarce: ${RESOURCES[view.options.scarceResource].name}`);
  }
  byId("current-seed").textContent = parts.join(" | ");
}

function renderRulesAndSetup(): void {
  const view = state.boardView;
  const body = byId("rules-body");
  if (!view) {
    body.innerHTML = "<p>Generate a board to see setup rules.</p>";
    return;
  }
  const variant = view.selection.variant;
  const preset = RULE_PRESETS[view.selection.rulePreset];
  const challenges = view.selection.challenges.map((challenge) => CHALLENGE_NAMES[challenge]);
  const expansions = view.selection.expansions.map((expansion) => EXPANSION_NAMES[expansion]);
  const neutralCount = getGhostSettlements(
    view.selection.mode,
    view.selection.variant,
    view.selection.challenges,
  ).length;
  const neutralRoadText = neutralCount > 0 && preset.neutralRoads
    ? "Place the neutral road markers connected to those neutral settlements."
    : "No neutral roads are used for this rules preset.";

  const setupRules = view.selection.mode === "2"
    ? `
    <h3>2-Player Setup</h3>
    <p><strong>${VARIANT_NAMES[variant]}</strong>: ${VARIANT_DESCRIPTIONS[variant]}</p>
    <p><strong>${RULE_PRESET_NAMES[view.selection.rulePreset]}</strong>: ${preset.summary}</p>
    <ol>
      <li>Use the ${
      variant.startsWith("compact") ? "13-hex compact board" : "19-hex full board"
    } shown above.</li>
      <li>${
      variant === "full-open" || variant === "compact-duel"
        ? "No neutral settlements are used."
        : "Place the neutral settlements marked with N on the board vertices."
    }</li>
      <li>${neutralRoadText}</li>
      <li>Each player starts with ${preset.startingSettlements} settlements and ${preset.startingRoads} roads.</li>
      <li>First to ${preset.victoryPoints} victory points wins.</li>
    </ol>
    <p class="muted">Rendered setup markers: ${neutralCount} neutral settlements${
      neutralCount > 0 && preset.neutralRoads ? ` and ${neutralCount} neutral roads` : ""
    }</p>`
    : `
    <h3>Standard Setup</h3>
    <p>Use the generated 19-hex island with normal 3-4 player Catan setup rules.</p>`;

  const challengeRules = challenges.length
    ? `<p><strong>Active challenges:</strong> ${challenges.join(", ")}</p>`
    : `<p><strong>Active challenges:</strong> None</p>`;
  const expansionRules = expansions.length
    ? `<p><strong>Expansion notes:</strong> ${renderExpansionNotes(view.selection.expansions)}</p>`
    : `<p><strong>Expansion notes:</strong> None selected.</p>`;

  body.innerHTML = `
    <div class="rules-block">
      ${setupRules}
    </div>
    <div class="rules-block">
      <h3>Active Effects</h3>
      ${challengeRules}
      ${expansionRules}
      <p class="muted">Harbor scramble shuffles harbor types across the active board's frame slots.</p>
    </div>
  `;
}

function renderExpansionNotes(expansions: readonly Expansion[]): string {
  const notes = expansions.map((expansion) => {
    if (expansion === "five-six-players") {
      return "5-6 player extension uses a 30-hex island and 11 harbor slots";
    }
    if (expansion === "seafarers") {
      return "Seafarers uses a sea-and-gold scenario layout";
    }
    return "Cities & Knights adds commodities, barbarians, knights, and a 13-point target";
  });
  return notes.join("; ");
}

function renderSeedHistory(): void {
  const panel = byId("seed-history-panel");
  const list = byId("seed-history");
  panel.classList.toggle("hidden", seedHistory.length === 0);
  list.replaceChildren();
  seedHistory.forEach((entry, index) => {
    const challengeText = entry.challenges.length
      ? ` | ${entry.challenges.map((challenge) => CHALLENGE_NAMES[challenge]).join(", ")}`
      : "";
    const expansionText = entry.expansions?.length
      ? ` | ${entry.expansions.map((expansion) => EXPANSION_NAMES[expansion]).join(", ")}`
      : "";
    const ruleText = entry.mode === "2"
      ? ` | ${RULE_PRESET_NAMES[entry.rulePreset ?? "balanced-neutral"]}`
      : "";
    const difficultyText = entry.difficulty
      ? ` | Difficulty ${entry.difficulty.level}/5 ${entry.difficulty.label}`
      : "";

    const button = document.createElement("button");
    button.className = "history-item";
    button.dataset.historyIndex = String(index);

    const seedSpan = document.createElement("span");
    seedSpan.textContent = entry.seed;

    const detail = document.createElement("small");
    detail.textContent = `${entry.mode === "2" ? "2 Players" : "3-4 Players"} | ${
      VARIANT_NAMES[entry.variant]
    }${ruleText}${challengeText}${expansionText}${difficultyText}`;

    button.append(seedSpan, detail);
    list.appendChild(button);
  });
  list.querySelectorAll<HTMLElement>("[data-history-index]").forEach((button) => {
    button.addEventListener("click", () => restoreSeedHistory(Number(button.dataset.historyIndex)));
  });
}

function restoreSeedHistory(index: number): void {
  const entry = seedHistory[index];
  if (!entry) return;
  state = initialState({
    mode: entry.mode,
    variant: entry.variant,
    challenges: entry.challenges,
    expansions: entry.expansions ?? [],
    rulePreset: entry.rulePreset ?? "balanced-neutral",
  });
  syncControlsFromState();
  generateBoard(entry.seed, true);
}

function clearSeedHistory(): void {
  seedHistory = [];
  saveJson(HISTORY_KEY, seedHistory);
  renderSeedHistory();
}

function copySeedHistory(): void {
  if (!seedHistory.length) {
    showNotification("Seed history is empty.");
    return;
  }
  const lines = seedHistory.map((entry, index) => {
    const difficulty = entry.difficulty
      ? `Difficulty ${entry.difficulty.level}/5 ${entry.difficulty.label}`
      : "Difficulty not saved";
    return [
      `${index + 1}. ${entry.seed}`,
      `Mode: ${entry.mode === "2" ? "2 Players" : "3-4 Players"}`,
      `Variant: ${VARIANT_NAMES[entry.variant]}`,
      `Rules: ${
        entry.mode === "2" ? RULE_PRESET_NAMES[entry.rulePreset ?? "balanced-neutral"] : "Standard"
      }`,
      `Challenges: ${
        entry.challenges.map((challenge) => CHALLENGE_NAMES[challenge]).join(", ") || "None"
      }`,
      `Expansions: ${
        (entry.expansions ?? []).map((expansion) => EXPANSION_NAMES[expansion]).join(", ") ||
        "None"
      }`,
      difficulty,
      `Saved: ${entry.createdAt}`,
      `URL: ${
        createShareUrl(globalThis.location.href, entry.seed, {
          mode: entry.mode,
          variant: entry.variant,
          challenges: entry.challenges,
          expansions: entry.expansions ?? [],
          rulePreset: entry.rulePreset ?? "balanced-neutral",
        })
      }`,
    ].join("\n");
  });
  copyText(`Catan seed history\n\n${lines.join("\n\n")}`, "Seed history copied.");
}

function copyCurrentUrl(): void {
  const view = state.boardView;
  if (!view) {
    showNotification("Generate or load a board first.");
    return;
  }
  copyText(
    createShareUrl(globalThis.location.href, view.seed, view.selection),
    "Share URL copied.",
  );
}

function copyText(text: string, message: string): void {
  if (!text) {
    showNotification("Generate or load a board first.");
    return;
  }
  navigator.clipboard.writeText(text).then(() => showNotification(message)).catch(() => {
    showNotification("Clipboard is unavailable in this browser.");
  });
}

function syncControlsFromState(): void {
  const mode = state.selection.mode;
  byId("mode-34").classList.toggle("is-selected", mode === "3-4");
  byId("mode-2").classList.toggle("is-selected", mode === "2");
  setDisabled("variant-select", mode !== "2");
  setDisabled("rule-preset-select", mode !== "2");
  setDisabled("challenge-neutral", mode !== "2");
  byId("variant-control").classList.toggle("is-disabled", mode !== "2");
  byId("rules-control").classList.toggle("is-disabled", mode !== "2");
  byId("challenge-neutral-control").classList.toggle("is-disabled", mode !== "2");
  byId("variant-note").textContent = mode === "2"
    ? "Changes the 2-player board variant."
    : "Disabled in 3-4 player mode.";
  byId("rules-note").textContent = mode === "2"
    ? "Changes setup notes and neutral road overlays."
    : "Disabled in 3-4 player mode.";
  setSelectValue("variant-select", state.selection.variant);
  setSelectValue("rule-preset-select", state.selection.rulePreset);
  setChecked("challenge-scarce", state.selection.challenges.includes("scarce"));
  setChecked("challenge-harbors", state.selection.challenges.includes("harbors"));
  setChecked("challenge-neutral", state.selection.challenges.includes("neutral"));
  setChecked("expansion-five-six-players", state.selection.expansions.includes("five-six-players"));
  setChecked("expansion-seafarers", state.selection.expansions.includes("seafarers"));
  setChecked("expansion-cities-knights", state.selection.expansions.includes("cities-knights"));
  renderRulesAndSetup();
}

function readChallenges(): readonly Challenge[] {
  return [
    isChecked("challenge-scarce") ? "scarce" : null,
    isChecked("challenge-harbors") ? "harbors" : null,
    isChecked("challenge-neutral") ? "neutral" : null,
  ].filter((challenge): challenge is Challenge => challenge !== null);
}

function readExpansions(): readonly Expansion[] {
  return [
    isChecked("expansion-five-six-players") ? "five-six-players" : null,
    isChecked("expansion-seafarers") ? "seafarers" : null,
    isChecked("expansion-cities-knights") ? "cities-knights" : null,
  ].filter((expansion): expansion is Expansion => expansion !== null);
}

function toggleSection(sectionId: string): void {
  collapsedSections = {
    ...collapsedSections,
    [sectionId]: !collapsedSections[sectionId],
  };
  saveJson(PANEL_STATE_KEY, collapsedSections);
  renderPanelState();
}

function toggleAllSections(): void {
  const shouldExpand = sections.every((section) => collapsedSections[section]);
  collapsedSections = Object.fromEntries(sections.map((section) => [section, !shouldExpand]));
  saveJson(PANEL_STATE_KEY, collapsedSections);
  renderPanelState();
  showNotification(
    shouldExpand ? "All sections expanded." : "All sections except the board are collapsed.",
  );
}

function renderPanelState(): void {
  sections.forEach((section) => {
    byId(`section-${section}`).classList.toggle(
      "is-collapsed",
      Boolean(collapsedSections[section]),
    );
    const icon = document.querySelector(`[data-section-icon="${section}"]`);
    if (icon) icon.textContent = collapsedSections[section] ? "+" : "-";
  });
  byId("collapse-all-btn").textContent = sections.every((section) => collapsedSections[section])
    ? "Expand"
    : "Collapse";
}

function toggleResourceHighlight(resource: Resource): void {
  selectedResource = selectedResource === resource ? null : resource;
  applyResourceHighlight();
}

function applyResourceHighlight(): void {
  document.querySelectorAll<HTMLElement>("[data-resource]").forEach((element) => {
    const matches = selectedResource !== null && element.dataset.resource === selectedResource;
    const dims = selectedResource !== null && element.dataset.resource !== selectedResource;
    element.classList.toggle("is-selected-resource", matches);
    element.classList.toggle("is-dimmed-resource", dims);
    if (element.classList.contains("stat-tile")) {
      element.setAttribute("aria-pressed", String(matches));
    }
  });
}

function applyStoredTheme(): void {
  document.body.classList.toggle("dark", loadJson<string>(THEME_KEY, "light") === "dark");
  updateThemeButton();
}

function toggleTheme(): void {
  const nextTheme = document.body.classList.contains("dark") ? "light" : "dark";
  document.body.classList.toggle("dark", nextTheme === "dark");
  saveJson(THEME_KEY, nextTheme);
  updateThemeButton();
}

function updateThemeButton(): void {
  byId("theme-toggle-btn").textContent = document.body.classList.contains("dark")
    ? "Light"
    : "Dark";
}

function toggleFullscreen(): void {
  const panel = byId("board-panel");
  if (!document.fullscreenEnabled) {
    showNotification("Fullscreen is unavailable in this browser.");
    return;
  }
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    panel.requestFullscreen().catch(() => showNotification("Fullscreen could not be opened."));
  }
}

function updateFullscreenButton(): void {
  byId("fullscreen-btn").textContent = document.fullscreenElement
    ? "Exit Fullscreen"
    : "Fullscreen";
}

let zoomState = { scale: 1, panX: 0, panY: 0 };
let applyZoom = (): void => {};
let zoomAbortController: AbortController | null = null;

type Point = {
  readonly x: number;
  readonly y: number;
};

function initZoom(): void {
  zoomAbortController?.abort();
  zoomAbortController = new AbortController();
  const wrapper = byId("zoom-wrapper");
  const content = byId("zoom-content");
  applyZoom = () => {
    content.style.transform =
      `translate(${zoomState.panX}px, ${zoomState.panY}px) scale(${zoomState.scale})`;
    content.style.transformOrigin = "0 0";
  };

  let isPanning = false;
  const setScale = (nextScale: number, cx: number, cy: number) => {
    const previous = zoomState.scale;
    const scale = Math.min(4, Math.max(0.2, nextScale));
    zoomState = {
      scale,
      panX: cx - (cx - zoomState.panX) * (scale / previous),
      panY: cy - (cy - zoomState.panY) * (scale / previous),
    };
    clampPan();
    applyZoom();
  };

  const boardSize = () => {
    const svg = byId("board-svg") as unknown as SVGSVGElement;
    const viewBox = svg.viewBox.baseVal;
    return {
      height: viewBox.height || Number(svg.getAttribute("height")) || 1,
      width: viewBox.width || Number(svg.getAttribute("width")) || 1,
    };
  };
  const clampAxis = (pan: number, wrapperSize: number, contentSize: number) => {
    const scaledSize = contentSize * zoomState.scale;
    const minVisible = Math.min(48, wrapperSize * 0.35, scaledSize);
    return Math.min(wrapperSize - minVisible, Math.max(minVisible - scaledSize, pan));
  };
  const clampPan = () => {
    const rect = wrapper.getBoundingClientRect();
    const size = boardSize();
    zoomState = {
      ...zoomState,
      panX: clampAxis(zoomState.panX, rect.width, size.width),
      panY: clampAxis(zoomState.panY, rect.height, size.height),
    };
  };
  const pointFromEvent = (event: PointerEvent): Point => ({
    x: event.clientX,
    y: event.clientY,
  });
  const distanceBetween = (first: Point, second: Point) =>
    Math.hypot(first.x - second.x, first.y - second.y);
  const midpoint = (first: Point, second: Point): Point => ({
    x: (first.x + second.x) / 2,
    y: (first.y + second.y) / 2,
  });

  wrapper.addEventListener("wheel", (event) => {
    event.preventDefault();
    const rect = wrapper.getBoundingClientRect();
    setScale(
      zoomState.scale * (event.deltaY > 0 ? 0.9 : 1.1),
      event.clientX - rect.left,
      event.clientY - rect.top,
    );
  }, { passive: false, signal: zoomAbortController.signal });

  const activePointers = new Map<number, Point>();
  let lastPanPoint: Point | null = null;
  let pinchStart: { readonly distance: number; readonly scale: number } | null = null;
  let tapStart: {
    readonly pointerId: number;
    readonly point: Point;
    readonly resource: Resource;
  } | null = null;

  wrapper.addEventListener("pointerdown", (event) => {
    if (event.target instanceof Element && event.target.closest(".zoom-controls")) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const resourceElement = event.target instanceof Element
      ? event.target.closest<HTMLElement>("[data-resource]")
      : null;
    event.preventDefault();
    wrapper.setPointerCapture(event.pointerId);
    activePointers.set(event.pointerId, pointFromEvent(event));
    isPanning = activePointers.size === 1;
    lastPanPoint = activePointers.size === 1 ? pointFromEvent(event) : null;
    pinchStart = null;
    tapStart = resourceElement?.dataset.resource
      ? {
        pointerId: event.pointerId,
        point: pointFromEvent(event),
        resource: resourceElement.dataset.resource as Resource,
      }
      : null;
  }, { signal: zoomAbortController.signal });

  wrapper.addEventListener("pointermove", (event) => {
    if (!activePointers.has(event.pointerId)) return;
    event.preventDefault();
    if (
      tapStart?.pointerId === event.pointerId &&
      distanceBetween(tapStart.point, pointFromEvent(event)) > 8
    ) {
      tapStart = null;
    }
    activePointers.set(event.pointerId, pointFromEvent(event));
    const points = [...activePointers.values()];
    if (points.length >= 2) {
      const [first, second] = points;
      if (!first || !second) return;
      const distance = distanceBetween(first, second);
      const center = midpoint(first, second);
      const rect = wrapper.getBoundingClientRect();
      pinchStart ??= { distance, scale: zoomState.scale };
      setScale(
        pinchStart.scale * (distance / Math.max(1, pinchStart.distance)),
        center.x - rect.left,
        center.y - rect.top,
      );
      return;
    }
    if (!isPanning || !lastPanPoint || !points[0]) return;
    const point = points[0];
    zoomState = {
      ...zoomState,
      panX: zoomState.panX + point.x - lastPanPoint.x,
      panY: zoomState.panY + point.y - lastPanPoint.y,
    };
    clampPan();
    lastPanPoint = point;
    applyZoom();
  }, { signal: zoomAbortController.signal });

  const endPointer = (event: PointerEvent) => {
    if (!activePointers.has(event.pointerId)) return;
    if (
      tapStart?.pointerId === event.pointerId &&
      distanceBetween(tapStart.point, pointFromEvent(event)) <= 8
    ) {
      toggleResourceHighlight(tapStart.resource);
    }
    tapStart = null;
    activePointers.delete(event.pointerId);
    if (wrapper.hasPointerCapture(event.pointerId)) wrapper.releasePointerCapture(event.pointerId);
    const remaining = [...activePointers.values()];
    isPanning = remaining.length === 1;
    lastPanPoint = remaining[0] ?? null;
    pinchStart = null;
  };
  wrapper.addEventListener("pointerup", endPointer, { signal: zoomAbortController.signal });
  wrapper.addEventListener("pointercancel", endPointer, { signal: zoomAbortController.signal });
  wrapper.addEventListener("lostpointercapture", (event) => {
    activePointers.delete(event.pointerId);
    const remaining = [...activePointers.values()];
    isPanning = remaining.length === 1;
    lastPanPoint = remaining[0] ?? null;
    pinchStart = null;
  }, { signal: zoomAbortController.signal });

  byId("zoom-in-btn").addEventListener("click", () => {
    const rect = wrapper.getBoundingClientRect();
    setScale(zoomState.scale * 1.3, rect.width / 2, rect.height / 2);
  }, { signal: zoomAbortController.signal });
  byId("zoom-out-btn").addEventListener("click", () => {
    const rect = wrapper.getBoundingClientRect();
    setScale(zoomState.scale / 1.3, rect.width / 2, rect.height / 2);
  }, { signal: zoomAbortController.signal });
  byId("zoom-reset-btn").addEventListener("click", resetZoom, {
    signal: zoomAbortController.signal,
  });
  globalThis.addEventListener("resize", resetZoom, { signal: zoomAbortController.signal });
  resetZoom();
}

function resetZoom(): void {
  const wrapper = byId("zoom-wrapper");
  const svg = byId("board-svg") as unknown as SVGSVGElement;
  const viewBox = svg.viewBox.baseVal;
  const boardWidth = viewBox.width || Number(svg.getAttribute("width")) || 1;
  const boardHeight = viewBox.height || Number(svg.getAttribute("height")) || 1;
  const rect = wrapper.getBoundingClientRect();
  const fitScale = Math.min(rect.width / boardWidth, rect.height / boardHeight, 1) * 0.96;
  const scale = Math.max(0.2, fitScale);
  zoomState = {
    scale,
    panX: Math.max(0, (rect.width - boardWidth * scale) / 2),
    panY: Math.max(0, (rect.height - boardHeight * scale) / 2),
  };
  applyZoom();
}

function loadJson<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    showNotification("Local saving is unavailable in this browser.");
  }
}

function showNotification(message: string): void {
  const notification = document.createElement("div");
  notification.className = "notification";
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

function byId(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing element: ${id}`);
  return element;
}

function inputValue(id: string): string {
  return (byId(id) as HTMLInputElement).value;
}

function setInputValue(id: string, value: string): void {
  (byId(id) as HTMLInputElement).value = value;
}

function selectValue(id: string): string {
  return (byId(id) as HTMLSelectElement).value;
}

function setSelectValue(id: string, value: string): void {
  (byId(id) as HTMLSelectElement).value = value;
}

function isChecked(id: string): boolean {
  return (byId(id) as HTMLInputElement).checked;
}

function setChecked(id: string, checked: boolean): void {
  (byId(id) as HTMLInputElement).checked = checked;
}

function setDisabled(id: string, disabled: boolean): void {
  (byId(id) as HTMLInputElement | HTMLSelectElement).disabled = disabled;
}
