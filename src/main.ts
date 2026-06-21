import type { AppState } from "./app/app-state.ts";
import {
  initialState,
  withBalanceProfile,
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
import { createBoardQualityNotes } from "./domain/quality.ts";
import { seedToHexColor } from "./domain/seed-color.ts";
import { createShareUrl, parseShareSearch } from "./domain/share-url.ts";
import { upsertSeedHistory } from "./domain/history.ts";
import { renderBoardSvg } from "./rendering/svg.ts";
import type {
  BalanceProfile,
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
const RESOURCE_COLORS_KEY = "catan-board-resource-colors";
const sections = ["setup", "colors", "seed", "rules", "history", "stats"] as const;
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
type PortType = Resource | "3:1";
type MapSelection =
  | { readonly kind: "resource"; readonly resource: Resource }
  | { readonly kind: "port"; readonly portType: PortType }
  | { readonly kind: "neutral" };

let state: AppState;
let seedHistory: readonly SeedHistoryEntry[] = [];
let collapsedSections: Record<string, boolean> = {};
let mapSelection: MapSelection | null = null;
let resourceColors: Partial<Record<Resource, string>> = {};

document.addEventListener("DOMContentLoaded", () => {
  const parsed = parseShareSearch(globalThis.location.search);
  state = initialState(parsed.selection);
  seedHistory = loadJson(HISTORY_KEY, []);
  collapsedSections = loadJson(PANEL_STATE_KEY, {});
  resourceColors = loadResourceColors();
  applyStoredTheme();
  renderResourceColorControls();
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
  byId("copy-share-link-btn").addEventListener("click", copyCurrentUrl);
  byId("fullscreen-btn").addEventListener("click", toggleFullscreen);
  byId("board-reset-zoom-btn").addEventListener("click", resetZoom);
  byId("clear-selection-btn").addEventListener("click", clearMapSelection);
  byId("theme-toggle-btn").addEventListener("click", toggleTheme);
  byId("collapse-all-btn").addEventListener("click", toggleAllSections);
  byId("reset-resource-colors-btn").addEventListener("click", resetResourceColors);
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
  byId("balance-profile-select").addEventListener("change", () => {
    state = withBalanceProfile(state, selectValue("balance-profile-select") as BalanceProfile);
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
  mapSelection = null;
  if (!state.boardView) return;
  const view = state.boardView;
  setInputValue("seed-input", view.seed);
  renderBoard(view);
  renderStats(view.board);
  renderQualityNotes();
  renderDifficulty();
  renderCurrentSeed();
  renderRulesAndSetup();
  updateSeedFavicon(view.seed);
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
      balanceProfile: view.selection.balanceProfile,
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
      resourceColors,
    })
  }
      </div>
    </div>
  `;
  initZoom();
  applyMapSelection();
}

function renderQualityNotes(): void {
  const view = state.boardView;
  const container = byId("quality-notes");
  if (!view) {
    container.replaceChildren();
    return;
  }
  container.innerHTML = createBoardQualityNotes({
    board: view.board,
    mode: view.selection.mode,
    options: view.options,
    ports: view.ports,
    difficulty: view.difficulty,
  }).map((note) =>
    `<div class="quality-note quality-note-${note.tone}">
      <strong>${note.label}</strong>
      <span>${note.detail}</span>
    </div>`
  ).join("");
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
        <strong><span class="resource-swatch" data-resource-swatch="${resource}" style="--resource-color: ${
        resourceColor(resource)
      }"></span>${definition.name}</strong>
        <span>${totals.count}x</span>
        <small>${totals.pips} pips</small>
      </button>`;
    }).join("");
  byId("stats").querySelectorAll<HTMLElement>("[data-resource]").forEach((tile) => {
    tile.addEventListener(
      "click",
      () => {
        const resource = tile.dataset.resource;
        if (isResource(resource)) {
          toggleMapSelection({ kind: "resource", resource });
        }
      },
    );
  });
  applyMapSelection();
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
  if (view.selection.balanceProfile !== "classic") {
    parts.push(`Balance: ${view.selection.balanceProfile}`);
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
  const neutralBuildText = neutralCount > 0
    ? "When a real player builds a road or settlement, also place one free legal road or settlement for a neutral player."
    : "No neutral-player build step is used for this board.";

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
      <li>Roll for production twice each turn and resolve both results.</li>
      <li>${neutralBuildText}</li>
      <li>If your table uses 2-player trade cards or tokens, give each player 4 at setup.</li>
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
  const harborRules = `<p><strong>Harbors:</strong> ${
    renderHarborNotes(view.selection.expansions, view.selection.challenges, view.ports.length)
  }</p>`;

  body.innerHTML = `
    <div class="rules-block">
      ${setupRules}
    </div>
    <div class="rules-block">
      <h3>Active Effects</h3>
      ${challengeRules}
      ${expansionRules}
      ${harborRules}
    </div>
  `;
}

function renderExpansionNotes(expansions: readonly Expansion[]): string {
  const notes = expansions.map((expansion) => {
    if (expansion === "five-six-players") {
      return "5-6 player extension uses a 30-hex island, 11 harbors, and paired-player turn rules";
    }
    if (expansion === "seafarers") {
      return "Seafarers uses a sea-and-gold scenario layout with ships, sea routes, and harbor tokens";
    }
    return "Cities & Knights adds commodities, barbarians, knights, city walls, and a 13-point target without changing this app's terrain layout";
  });
  return notes.join("; ");
}

function renderHarborNotes(
  expansions: readonly Expansion[],
  challenges: readonly Challenge[],
  portCount: number,
): string {
  if (expansions.includes("seafarers")) {
    return `${portCount} scenario harbor tokens are shuffled deterministically from the seed.`;
  }
  if (challenges.includes("harbors")) {
    return `${portCount} fixed coastal harbor slots are used, with harbor types scrambled by seed.`;
  }
  return `${portCount} fixed coastal harbor slots are used.`;
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
    const balanceText = entry.balanceProfile && entry.balanceProfile !== "classic"
      ? ` | ${entry.balanceProfile} balance`
      : "";

    const button = document.createElement("button");
    button.className = "history-item";
    button.dataset.historyIndex = String(index);

    const seedSpan = document.createElement("span");
    seedSpan.textContent = entry.seed;

    const detail = document.createElement("small");
    detail.textContent = `${entry.mode === "2" ? "2 Players" : "3-4 Players"} | ${
      VARIANT_NAMES[entry.variant]
    }${ruleText}${challengeText}${expansionText}${balanceText}${difficultyText}`;

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
    balanceProfile: entry.balanceProfile ?? "classic",
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
      `Balance: ${entry.balanceProfile ?? "classic"}`,
      difficulty,
      `Saved: ${entry.createdAt}`,
      `URL: ${
        createShareUrl(globalThis.location.href, entry.seed, {
          mode: entry.mode,
          variant: entry.variant,
          challenges: entry.challenges,
          expansions: entry.expansions ?? [],
          rulePreset: entry.rulePreset ?? "balanced-neutral",
          balanceProfile: entry.balanceProfile ?? "classic",
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
  setSelectValue("balance-profile-select", state.selection.balanceProfile);
  setChecked("challenge-scarce", state.selection.challenges.includes("scarce"));
  setChecked("challenge-harbors", state.selection.challenges.includes("harbors"));
  setChecked("challenge-neutral", state.selection.challenges.includes("neutral"));
  setChecked("expansion-five-six-players", state.selection.expansions.includes("five-six-players"));
  setChecked("expansion-seafarers", state.selection.expansions.includes("seafarers"));
  setChecked("expansion-cities-knights", state.selection.expansions.includes("cities-knights"));
  renderRulesAndSetup();
}

function updateSeedFavicon(seed: string): void {
  const color = seedToHexColor(seed);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path fill="${color}" d="M32 3 57 17.5v29L32 61 7 46.5v-29z"/><path fill="none" stroke="white" stroke-width="5" d="M32 11 50 21.5v21L32 53 14 42.5v-21z"/></svg>`;
  const favicon = document.querySelector<HTMLLinkElement>("#seed-favicon");
  if (favicon) favicon.href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
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

function renderResourceColorControls(): void {
  byId("resource-color-controls").innerHTML = resourceOrder
    .map((resource) => {
      const definition = RESOURCES[resource];
      const color = resourceColor(resource);
      return `<label class="color-control" for="resource-color-${resource}">
        <span><span class="resource-swatch" data-resource-swatch="${resource}" style="--resource-color: ${color}"></span>${definition.name}</span>
        <input type="color" id="resource-color-${resource}" data-resource-color="${resource}" value="${color}" aria-label="${definition.name} color">
      </label>`;
    }).join("");

  byId("resource-color-controls")
    .querySelectorAll<HTMLInputElement>("[data-resource-color]")
    .forEach((input) => {
      input.addEventListener("input", () => {
        const resource = input.dataset.resourceColor;
        if (isResource(resource)) setResourceColor(resource, input.value);
      });
    });
}

function setResourceColor(resource: Resource, color: string): void {
  if (!isHexColor(color)) return;
  const nextColor = normalizeHexColor(color);
  if (resourceColors[resource] === nextColor) return;
  resourceColors = { ...resourceColors, [resource]: nextColor };
  saveJson(RESOURCE_COLORS_KEY, resourceColors);
  updateResourceColorSwatches(resource);
  renderBoard(state.boardView);
  renderStats();
}

function resetResourceColors(): void {
  resourceColors = {};
  removeStoredJson(RESOURCE_COLORS_KEY);
  renderResourceColorControls();
  renderBoard(state.boardView);
  renderStats();
  showNotification("Resource colors reset.");
}

function loadResourceColors(): Partial<Record<Resource, string>> {
  const stored = loadJson<unknown>(RESOURCE_COLORS_KEY, {});
  if (!stored || typeof stored !== "object" || Array.isArray(stored)) return {};
  const values = stored as Record<string, unknown>;
  return resourceOrder.reduce<Partial<Record<Resource, string>>>((colors, resource) => {
    const color = values[resource];
    return typeof color === "string" && isHexColor(color)
      ? { ...colors, [resource]: normalizeHexColor(color) }
      : colors;
  }, {});
}

function resourceColor(resource: Resource): string {
  return resourceColors[resource] ?? RESOURCES[resource].color;
}

function updateResourceColorSwatches(resource: Resource): void {
  document.querySelectorAll<HTMLElement>(`[data-resource-swatch="${resource}"]`).forEach(
    (swatch) => {
      swatch.style.setProperty("--resource-color", resourceColor(resource));
    },
  );
}

function isResource(value: string | undefined): value is Resource {
  return resourceOrder.some((resource) => resource === value);
}

function isHexColor(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

function normalizeHexColor(value: string): string {
  return value.toLowerCase();
}

function toggleMapSelection(selection: MapSelection): void {
  mapSelection = selectionsMatch(mapSelection, selection) ? null : selection;
  applyMapSelection();
}

function clearMapSelection(): void {
  if (mapSelection === null) return;
  mapSelection = null;
  applyMapSelection();
}

function selectionsMatch(left: MapSelection | null, right: MapSelection): boolean {
  if (!left || left.kind !== right.kind) return false;
  if (left.kind === "resource" && right.kind === "resource") {
    return left.resource === right.resource;
  }
  if (left.kind === "port" && right.kind === "port") {
    return left.portType === right.portType;
  }
  return left.kind === "neutral" && right.kind === "neutral";
}

function applyMapSelection(): void {
  document.querySelectorAll<HTMLElement>("[data-resource]").forEach((element) => {
    const resource = element.dataset.resource;
    const matches = resource !== undefined && resourceMatchesSelection(resource);
    const dims = mapSelection !== null && !matches;
    element.classList.toggle("is-selected-resource", matches);
    element.classList.toggle("is-dimmed-resource", dims);
    if (element.classList.contains("stat-tile")) {
      element.setAttribute("aria-pressed", String(matches));
    }
  });

  document.querySelectorAll<HTMLElement>("[data-port-type]").forEach((element) => {
    const portType = element.dataset.portType;
    const matches = portType !== undefined && portMatchesSelection(portType);
    element.classList.toggle("is-selected-port", matches);
    element.classList.toggle("is-dimmed-map", mapSelection !== null && !matches);
  });

  document.querySelectorAll<HTMLElement>("[data-neutral-marker]").forEach((element) => {
    const matches = mapSelection?.kind === "neutral";
    element.classList.toggle("is-selected-neutral", matches);
    element.classList.toggle("is-dimmed-map", mapSelection !== null && !matches);
  });

  byId("clear-selection-btn").setAttribute("aria-pressed", String(mapSelection !== null));
}

function resourceMatchesSelection(resource: string): boolean {
  if (mapSelection?.kind === "resource") return mapSelection.resource === resource;
  if (mapSelection?.kind === "port") return mapSelection.portType === resource;
  return false;
}

function portMatchesSelection(portType: string): boolean {
  if (mapSelection?.kind === "port") return mapSelection.portType === portType;
  if (mapSelection?.kind === "resource") return mapSelection.resource === portType;
  return false;
}

function selectionFromElement(element: Element | null): MapSelection | null {
  const neutral = element?.closest<HTMLElement>("[data-neutral-marker]");
  if (neutral) return { kind: "neutral" };

  const port = element?.closest<HTMLElement>("[data-port-type]");
  const portType = port?.dataset.portType;
  if (isPortType(portType)) {
    return { kind: "port", portType };
  }

  const resource = element?.closest<HTMLElement>("[data-resource]");
  const resourceName = resource?.dataset.resource;
  if (isResource(resourceName)) {
    return { kind: "resource", resource: resourceName };
  }
  return null;
}

function isPortType(value: string | undefined): value is PortType {
  return value === "3:1" || isResource(value);
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
    readonly selection: MapSelection | null;
    readonly startedOnBoard: boolean;
  } | null = null;

  wrapper.addEventListener("pointerdown", (event) => {
    if (event.target instanceof Element && event.target.closest(".zoom-controls")) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const target = event.target instanceof Element ? event.target : null;
    event.preventDefault();
    wrapper.setPointerCapture(event.pointerId);
    activePointers.set(event.pointerId, pointFromEvent(event));
    isPanning = activePointers.size === 1;
    lastPanPoint = activePointers.size === 1 ? pointFromEvent(event) : null;
    pinchStart = null;
    tapStart = {
      pointerId: event.pointerId,
      point: pointFromEvent(event),
      selection: selectionFromElement(target),
      startedOnBoard: Boolean(target?.closest("#board-svg")),
    };
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
      if (tapStart.selection) {
        toggleMapSelection(tapStart.selection);
      } else if (tapStart.startedOnBoard) {
        clearMapSelection();
      }
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

function removeStoredJson(key: string): void {
  try {
    localStorage.removeItem(key);
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
