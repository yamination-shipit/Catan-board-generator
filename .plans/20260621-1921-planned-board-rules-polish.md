# Board Rules Polish

## Summary

Fix harbor correctness, add neutral and harbor map selection, make selection clearing explicit, deepen
setup notes, and polish SVG readability.

## Implementation

- Correct harbor fixtures for base, compact, 5-6, and Seafarers layouts.
- Render harbors and neutral markers as grouped SVG elements with data attributes and accessible
  labels.
- Replace resource-only highlight state with a single map selection state for resources, harbors,
  and neutral markers.
- Add a board toolbar clear-selection control and empty-board deselect behavior.
- Expand rules/setup copy for two-player, harbor, Seafarers, and Cities & Knights notes.
- Add domain and Playwright coverage for harbor fixtures and map-selection behavior.

## Validation

- Pending: `just check`
- Pending: `just test`
- Pending: `just test-honeycomb`
- Pending: `just ci`

## Risks

- Harbor geometry must stay compatible with the existing row/column and vertex model.
- Seafarers v1 remains a scenario-style summary, not a full scenario catalog.
