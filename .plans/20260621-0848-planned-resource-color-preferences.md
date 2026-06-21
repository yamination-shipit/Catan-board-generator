# Resource Color Preferences

## Summary

Restore wheat to the previous golden default and add per-browser resource color preferences.
Preferences stay in localStorage and do not affect seeds or share URLs.

## Plan

- Restore `RESOURCES.wheat.color` to `#f4c430`.
- Add a browser-local `catan-board-resource-colors` preference map, validating values before use.
- Let the SVG renderer accept optional resource color overrides.
- Add compact color controls for every resource shown by the app.
- Re-render the current board and stats immediately after color changes without changing the seed.
- Update tests for the wheat default and browser persistence.

## Validation

- Pending: `just check`
- Pending: `just test`
- Pending: `just test-honeycomb`
- Pending: `just ci`

## Risks

- Custom colors can reduce text contrast; this first pass keeps the existing text styling and leaves
  contrast-aware text as a follow-up.
