# Smarter Share, Quality, Favicon, and Release Guardrails

## Task

Implemented full-link-first sharing, seed-colored favicons, board quality notes, explicit balance
profiles, saved-history dedupe for full board choices, and Release Please guardrails.

## Files Changed

- App behavior: `src/main.ts`, `src/index.html`, `src/styles.css`, `src/domain/*`, `src/app/*`,
  `src/types.ts`.
- Tests/docs: `tests/domain_behavior_test.ts`, `tests/honeycomb_behavior_test.ts`, `README.md`,
  `docs/adr/0007-balance-profiles-change-generation.md`.
- Release repair: `.github/workflows/pr-title.yml`, `release-please-config.json`, `CHANGELOG.md`,
  `docs/adr/0004-release-and-supply-chain.md`.
- Plan: `.plans/20260621-1957-done-smarter-share-quality-favicon.md`.

## Root Cause And Repair

- Root cause: PR-title validation allowed generated branch-style titles, so titles such as
  `Feat: Codex/...` could become release-driving merge commits and Release Please changelog entries.
- Affected artifact repaired: removed the duplicated `0.2.0` changelog section and replaced
  generated-title release notes with meaningful text.
- Guardrail added: PR titles now must be lowercase Conventional Commits; Release Please changelog
  sections are restricted to `feat`, `fix`, and `perf`.
- Learning: generated GitHub titles are convenient for merges, but they are too broad when release
  automation reads commit history for semver intent.

## Validation

- `just check`: passed.
- `just test`: passed with 27 domain tests.
- `just test-honeycomb`: passed.
- `just ci`: passed.
- Release workflow smoke: bad title `Codex/board rules polish` rejected; good title
  `feat(board): add smarter sharing` accepted.
- Release config smoke: `release-please-config.json` and `.release-please-manifest.json` parse as
  JSON.

## Remaining Risk

The GitHub-hosted Release Please action was not live-run from this branch. The local guardrails
cover the previous bad decision point, and the next release PR should be checked for a single
sensible version bump before merge.
