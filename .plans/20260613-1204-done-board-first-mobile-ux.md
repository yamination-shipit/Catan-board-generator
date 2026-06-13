# Board-First Mobile UX

Status: done Branch: `codex/catan-game-options-history`

## Goal

Implement a board-first mobile experience with automatic board loading, fullscreen board controls,
collapsible panels, expanded 2-player variants, generated difficulty ratings, local seed history,
and bulk seed-history sharing.

## Planned Changes

- Generate a visible board on first load when no seed URL parameter is present.
- Move the board near the top with compact mobile spacing and tap-friendly board actions.
- Make every non-board section collapsible and add a collapse-all control.
- Add board fullscreen support with overlay controls.
- Add a persisted light/dark theme toggle.
- Expand 2-player variants with compact duel and compact tight modes.
- Add per-board difficulty rating and save difficulty metadata in seed history.
- Keep saved seeds in `localStorage`, not cookies, with graceful storage fallbacks.
- Add bulk history sharing that copies saved share URLs and metadata.
- Update README and handover documentation after validation.

## Validation Plan

- Run an inline JavaScript syntax check with `node --check`.
- Run a Node smoke test against extracted app logic for standard and compact variants.
- Serve `index.html` locally and verify the page responds.
- Manually inspect the resulting HTML/CSS/JS for mobile layout, fullscreen controls, and collapsible
  section behavior.

## Implementation Notes

- Board now auto-generates when no seed is provided and appears as the first main panel.
- Non-board areas are collapsible and panel state is saved in localStorage.
- Theme toggle persists light/dark choice in localStorage.
- 2-player mode now includes full neutral, full open, full tight, compact duel, and compact tight
  variants.
- Difficulty metadata is calculated per board and saved with seed history.
- Seed history remains localStorage-based, with bulk copy/export of share URLs and metadata.

## Validation

- Inline JavaScript syntax check passed.
- Node smoke test passed for full tight and compact tight 2-player variants.
- Local static server returned `200 OK` at `http://127.0.0.1:8765/`.

## Risks

- Compact variant distributions must match their layout size so generation does not underflow number
  tokens.
- Fullscreen controls must not break existing zoom/pan event handling.
- Seed history should remain backward-compatible with prior entries that lack difficulty metadata.
