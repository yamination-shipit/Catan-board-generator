# Seed-Safe Expansions And Honeycomb Tests

## Status

Planned.

## Goal

Implement seed-safe expansion toggles, 2-player rule presets with neutral road indicators, board
fit/collapse fixes, ADR workflow updates, and opt-in honeycomb browser tests while preserving
historical seed output.

## Implementation Notes

- Keep old seed URLs and omitted options on current defaults.
- Record expansion selections in URLs/history without changing board generation yet.
- Add named 2-player rules for setup guidance and overlay rendering only.
- Fit the SVG board to its container by default and on reset.
- Add a separate long-running honeycomb test command and manual workflow.

## Validation

- Pending: `just check`
- Pending: `just test`
- Pending: `just build`
- Pending: honeycomb test attempt
- Pending: `just ci`
