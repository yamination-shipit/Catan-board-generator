import type { AppState } from "./app/app-state.ts";
import { initialState, withBoard, withChallenges, withMode, withVariant } from "./app/app-state.ts";
import { createRandomSeed } from "./app/seed.ts";
import { CHALLENGE_NAMES, RESOURCES, VARIANT_DESCRIPTIONS, VARIANT_NAMES } from "./domain/rules.ts";
import { getGhostSettlements } from "./domain/options.ts";
import { createShareUrl, parseShareSearch } from "./domain/share-url.ts";
import { upsertSeedHistory } from "./domain/history.ts";
import { renderBoardSvg } from "./rendering/svg.ts";
import type { Challenge, Mode, SeedHistoryEntry, Variant } from "./types.ts";

const HISTORY_KEY = "catan-board-seed-history";
const PANEL_STATE_KEY = "catan-board-panel-state";
const THEME_KEY = "catan-board-theme";
const sections = ["setup", "seed", "twoPlayer", "history", "stats"] as const;

let state: AppState;
let seedHistory: readonly SeedHistoryEntry[] = [];
let collapsedSections: Record<string, boolean> = {};

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
  byId("collapse-all-btn").addEventListener("click", collapseAllSections);
  byId("share-history-btn").addEventListener("click", copySeedHistory);
  byId("clear-history-btn").addEventListener("click", clearSeedHistory);
  byId("variant-select").addEventListener("change", () => {
    state = withVariant(state, selectValue("variant-select") as Variant);
    refreshCurrentBoard();
  });
  ["challenge-scarce", "challenge-harbors", "challenge-neutral"].forEach((id) => {
    byId(id).addEventListener("change", () => {
      state = withChallenges(state, readChallenges());
      refreshCurrentBoard();
    });
  });
  document.querySelectorAll<HTMLElement>("[data-section-toggle]").forEach((button) => {
    button.addEventListener("click", () => toggleSection(button.dataset.sectionToggle ?? ""));
  });
  document.addEventListener("fullscreenchange", updateFullscreenButton);
}

function switchMode(mode: Mode): void {
  state = withMode(state, mode);
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
  renderSetupInstructions();
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
      ports: view.ports,
    })
  }
      </div>
    </div>
  `;
  initZoom();
}

function renderStats(board = state.boardView?.board ?? []): void {
  const counts = board.reduce<Record<string, number>>((stats, hex) => ({
    ...stats,
    [hex.resource]: (stats[hex.resource] ?? 0) + 1,
  }), {});

  byId("stats").innerHTML = Object.entries(counts).map(([resource, count]) => {
    const definition = RESOURCES[resource as keyof typeof RESOURCES];
    return `<div class="stat-tile"><strong>${definition.name}</strong><span>${count}x</span></div>`;
  }).join("");
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
  if (view.options.scarceResource) {
    parts.push(`Scarce: ${RESOURCES[view.options.scarceResource].name}`);
  }
  byId("current-seed").textContent = parts.join(" | ");
}

function renderSetupInstructions(): void {
  const view = state.boardView;
  const panel = byId("setup-instructions");
  if (!view || view.selection.mode !== "2") {
    panel.classList.add("hidden");
    return;
  }
  panel.classList.remove("hidden");
  const variant = view.selection.variant;
  const challenges = view.selection.challenges.map((challenge) => CHALLENGE_NAMES[challenge]);
  const neutralCount = getGhostSettlements(
    view.selection.mode,
    view.selection.variant,
    view.selection.challenges,
  ).length;
  byId("setup-body").innerHTML = `
    <p><strong>${VARIANT_NAMES[variant]}</strong></p>
    <p>${VARIANT_DESCRIPTIONS[variant]}</p>
    <ol>
      <li>Use the ${
    variant.startsWith("compact") ? "13-hex compact board" : "19-hex full board"
  } shown above.</li>
      <li>${
    variant === "full-open" || variant === "compact-duel"
      ? "No neutral settlements are used."
      : "Place the neutral settlements marked with N on the board vertices."
  }</li>
      <li>Each player starts with 2 settlements and 2 roads.</li>
      <li>First to 10 victory points wins unless your table agrees otherwise.</li>
    </ol>
    ${
    challenges.length ? `<p><strong>Active challenges:</strong> ${challenges.join(", ")}</p>` : ""
  }
    <p class="muted">Rendered setup markers: ${neutralCount}</p>
  `;
}

function renderSeedHistory(): void {
  const panel = byId("seed-history-panel");
  const list = byId("seed-history");
  panel.classList.toggle("hidden", seedHistory.length === 0);
  list.innerHTML = seedHistory.map((entry, index) => {
    const challengeText = entry.challenges.length
      ? ` | ${entry.challenges.map((challenge) => CHALLENGE_NAMES[challenge]).join(", ")}`
      : "";
    const difficultyText = entry.difficulty
      ? ` | Difficulty ${entry.difficulty.level}/5 ${entry.difficulty.label}`
      : "";
    return `<button class="history-item" data-history-index="${index}">
      <span>${entry.seed}</span>
      <small>${entry.mode === "2" ? "2 Players" : "3-4 Players"} | ${
      VARIANT_NAMES[entry.variant]
    }${challengeText}${difficultyText}</small>
    </button>`;
  }).join("");
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
      `Challenges: ${
        entry.challenges.map((challenge) => CHALLENGE_NAMES[challenge]).join(", ") || "None"
      }`,
      difficulty,
      `Saved: ${entry.createdAt}`,
      `URL: ${createShareUrl(globalThis.location.href, entry.seed, entry)}`,
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
  byId("variant-control").classList.toggle("hidden", mode !== "2");
  setSelectValue("variant-select", state.selection.variant);
  setChecked("challenge-scarce", state.selection.challenges.includes("scarce"));
  setChecked("challenge-harbors", state.selection.challenges.includes("harbors"));
  setChecked("challenge-neutral", state.selection.challenges.includes("neutral"));
  renderSetupInstructions();
}

function readChallenges(): readonly Challenge[] {
  return [
    isChecked("challenge-scarce") ? "scarce" : null,
    isChecked("challenge-harbors") ? "harbors" : null,
    isChecked("challenge-neutral") ? "neutral" : null,
  ].filter((challenge): challenge is Challenge => challenge !== null);
}

function toggleSection(sectionId: string): void {
  collapsedSections = {
    ...collapsedSections,
    [sectionId]: !collapsedSections[sectionId],
  };
  saveJson(PANEL_STATE_KEY, collapsedSections);
  renderPanelState();
}

function collapseAllSections(): void {
  collapsedSections = Object.fromEntries(sections.map((section) => [section, true]));
  saveJson(PANEL_STATE_KEY, collapsedSections);
  renderPanelState();
  showNotification("All sections except the board are collapsed.");
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

function initZoom(): void {
  const wrapper = byId("zoom-wrapper");
  const content = byId("zoom-content");
  zoomState = { scale: 1, panX: 0, panY: 0 };
  applyZoom = () => {
    content.style.transform =
      `translate(${zoomState.panX}px, ${zoomState.panY}px) scale(${zoomState.scale})`;
    content.style.transformOrigin = "0 0";
  };

  let isPanning = false;
  let startX = 0;
  let startY = 0;
  const setScale = (nextScale: number, cx: number, cy: number) => {
    const previous = zoomState.scale;
    const scale = Math.min(4, Math.max(0.5, nextScale));
    zoomState = {
      scale,
      panX: cx - (cx - zoomState.panX) * (scale / previous),
      panY: cy - (cy - zoomState.panY) * (scale / previous),
    };
    applyZoom();
  };

  wrapper.addEventListener("wheel", (event) => {
    event.preventDefault();
    const rect = wrapper.getBoundingClientRect();
    setScale(
      zoomState.scale * (event.deltaY > 0 ? 0.9 : 1.1),
      event.clientX - rect.left,
      event.clientY - rect.top,
    );
  }, { passive: false });

  wrapper.addEventListener("mousedown", (event) => {
    if (event.button !== 0) return;
    isPanning = true;
    startX = event.clientX - zoomState.panX;
    startY = event.clientY - zoomState.panY;
  });
  globalThis.addEventListener("mousemove", (event) => {
    if (!isPanning) return;
    zoomState = { ...zoomState, panX: event.clientX - startX, panY: event.clientY - startY };
    applyZoom();
  });
  globalThis.addEventListener("mouseup", () => {
    isPanning = false;
  });

  byId("zoom-in-btn").addEventListener("click", () => {
    const rect = wrapper.getBoundingClientRect();
    setScale(zoomState.scale * 1.3, rect.width / 2, rect.height / 2);
  });
  byId("zoom-out-btn").addEventListener("click", () => {
    const rect = wrapper.getBoundingClientRect();
    setScale(zoomState.scale / 1.3, rect.width / 2, rect.height / 2);
  });
  byId("zoom-reset-btn").addEventListener("click", resetZoom);
}

function resetZoom(): void {
  zoomState = { scale: 1, panX: 0, panY: 0 };
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
