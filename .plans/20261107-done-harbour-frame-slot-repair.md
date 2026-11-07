---
title: Harbour Frame Slot Repair
date: 2026-11-07
last_updated: 2026-11-07T16:20:49Z
type: implementation-plan
status: done
---

# Harbour Frame Slot Repair

## Goal

Correct the 5th-edition harbour fixture so no coastal intersection controls two harbours, while
preserving harbour types, counts, seeded scrambling, URLs, and board generation.

## Result

- Moved the 5th-edition brick harbour from the adjacent bottom edge to its separated frame slot.
- Added a regression requiring every harbour fixture to use coastal edges without shared vertices.
- Audited the 5th, 6th, compact, 5-6, and Seafarers fixtures; all are separated and coastal.
- Reformatted the fallback page so the repository's formatter gate passes.

## Validation

| Check                 | Result                                                      |
| --------------------- | ----------------------------------------------------------- |
| Red regression        | Failed on `4:2:3-4` and `4:1:2-3` sharing a coastal vertex. |
| `just test`           | Passed, 30 tests.                                           |
| `just check`          | Passed formatting, lint, and type checks.                   |
| `just ci`             | Passed checks, tests, and build.                            |
| `just test-honeycomb` | Unavailable: Playwright does not support Android.           |
| Generated `dist/`     | Rebuilt successfully with no tracked output difference.     |
