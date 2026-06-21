# Smarter Share, Quality, and Seed Favicon Plan

## Goal

Make full board links the default sharing path, add deterministic seed-colored favicons, and improve
board trust with quality notes plus opt-in balance profiles. Also repair the Release Please loop
caused by broad generated PR titles being accepted as release-driving commit titles.

## Implementation

- Sharing: make `Copy Link` the primary action in the board toolbar and Seed & Share panel, while
  keeping `Copy Seed` secondary.
- Favicon: derive a stable hex color from the active seed and update a generated SVG favicon when
  the board changes.
- Quality notes: add pure domain analysis for resource pip spread, high-pip pressure, scarcity,
  ports, and neutral pressure; render concise notes in Board Statistics.
- Balance profiles: add `classic`, `strict`, and `wild` as an explicit URL/state option, defaulting
  to `classic`; document generation compatibility in a new ADR.
- Saved history: include expansions, rules, and balance profile when deciding whether two saved
  entries are the same board choice.
- Tests: cover URL parsing/creation, quality notes, balance defaults, copy-link behavior, favicon
  color, and local-only resource colors.
- Release automation: require Conventional Commit PR titles, restrict Release Please changelog
  sections to release-worthy types, and clean duplicated/generated changelog entries.

## Validation

- `just check`: passed.
- `just test`: passed with 27 domain tests.
- `just test-honeycomb`: passed.
- `just ci`: passed.
- Release workflow smoke: `Codex/board rules polish` rejected by PR-title regex;
  `feat(board): add smarter sharing` accepted.
- Release config smoke: `release-please-config.json` and `.release-please-manifest.json` parse as
  JSON.

## Status

Done.
