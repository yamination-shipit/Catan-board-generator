# Seed-Safe Expansions And Honeycomb Tests

## Status

Done.

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

- Passed: `just check`
- Passed: `just test`
- Passed: `just build`
- Attempted: `just test-honeycomb`; Playwright launched but local Chromium is not installed in this
  environment. The manual Honeycomb workflow installs Chromium before running the suite.
- Passed: `just ci`
