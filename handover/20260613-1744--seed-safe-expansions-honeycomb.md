# Seed-Safe Expansions And Honeycomb Handover

Plan: `.plans/20260613-1744-done-seed-safe-expansions-honeycomb.md`
Branch: `codex/catan-game-options-history`

## Summary

Added seed-safe expansion metadata, 2-player rule presets, neutral road overlays, collapse/expand
behavior, board fit zoom reset, ADR guidance, and opt-in honeycomb browser tests.

## Validation

- `just check` passed.
- `just test` passed.
- `just build` passed.
- `just ci` passed.
- `just test-honeycomb` was attempted locally but Playwright Chromium is not installed in this
  environment. The manual Honeycomb workflow installs Chromium before running the suite.

## Notes

- Existing board snapshots for `docs-seed` remain unchanged when expansions are selected.
- Expansion toggles are URL/history metadata only until a future ADR defines generation rules.
- `deno.lock` now pins the Playwright npm dependency used by the opt-in honeycomb suite.
