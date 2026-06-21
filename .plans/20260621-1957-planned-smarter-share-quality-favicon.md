# Smarter Share, Quality, and Seed Favicon Plan

## Goal

Make full board links the default sharing path, add deterministic seed-colored favicons, and improve
board trust with quality notes plus opt-in balance profiles.

## Implementation

- Sharing: make `Copy Link` the primary action in the board toolbar and Seed & Share panel, while
  keeping `Copy Seed` secondary.
- Favicon: derive a stable hex color from the active seed and update a generated SVG favicon when
  the board changes.
- Quality notes: add pure domain analysis for resource pip spread, high-pip pressure, scarcity,
  ports, and neutral pressure; render concise notes in Board Statistics.
- Balance profiles: add `classic`, `strict`, and `wild` as an explicit URL/state option, defaulting
  to `classic`; document generation compatibility in a new ADR.
- Tests: cover URL parsing/creation, quality notes, balance defaults, copy-link behavior, favicon
  color, and local-only resource colors.

## Validation

- Run `just ci`.
- Build output must include updated static assets under `dist/`.

## Status

Planned.
