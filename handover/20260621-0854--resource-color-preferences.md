# Resource Color Preferences

## State

Implemented per-browser resource color preferences and restored wheat to `#f4c430`.

## Changed

- `src/main.ts` now loads, validates, saves, and applies `catan-board-resource-colors` from
  localStorage.
- `src/rendering/svg.ts` accepts optional resource color overrides while domain defaults remain in
  `RESOURCES`.
- `src/index.html` and `src/styles.css` add the Resource Colors controls and swatches.
- Tests cover the restored wheat default, renderer color overrides, browser persistence, and keeping
  colors out of share URLs.

## Validation

- Passed: `just check`
- Passed: `just test`
- Passed: `just test-honeycomb`
- Passed: `just ci`

## Plan

Current plan: `.plans/20260621-0848-done-resource-color-preferences.md`.

## Remaining Risk

User-selected colors can reduce label/token contrast. A future polish pass should add
contrast-aware text colors or a reset-to-defaults control if this becomes a real usability issue.
