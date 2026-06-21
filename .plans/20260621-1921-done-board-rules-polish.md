# Board Rules Polish

## Summary

Fix harbor correctness, add neutral and harbor map selection, make selection clearing explicit,
deepen setup notes, and polish SVG readability.

## Implementation

- Correct harbor fixtures for base, compact, 5-6, and Seafarers layouts.
- Render harbors and neutral markers as grouped SVG elements with data attributes and accessible
  labels.
- Replace resource-only highlight state with a single map selection state for resources, harbors,
  and neutral markers.
- Add a board toolbar clear-selection control and empty-board deselect behavior.
- Expand rules/setup copy for two-player, harbor, Seafarers, and Cities & Knights notes.
- Add domain and Playwright coverage for harbor fixtures and map-selection behavior.

## Progress

- Done: plan checkpoint committed on `codex/board-rules-polish`.
- Done: corrected harbor fixtures so all rendered ports attach to coastal edges.
- Done: Seafarers harbor tokens now shuffle deterministically by seed.
- Done: harbors and neutral markers render as grouped, selectable SVG elements.
- Done: map selection now supports resources, harbors, neutral markers, clear-selection, and
  empty-board deselect.
- Done: rules/setup notes now cover two-player production, neutral builds, harbor behavior, and
  expansion effects.

## Validation

- Pass: `just check`
- Pass: `just test`
- Pass: `just test-honeycomb`
- Pass: `just ci`

## Risks

- Seafarers v1 remains a scenario-style summary, not a full scenario catalog.
- Playwright Chromium had to be installed into the local cache before `just test-honeycomb` could
  run in this environment.
