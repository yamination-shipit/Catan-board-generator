# Board Rules Polish

Plan: `.plans/20260621-1921-done-board-rules-polish.md`

Branch: `codex/board-rules-polish`

## Summary

Fixed harbor placement/type behavior and added richer map selection for table setup.

## Changed

| Area      | Result                                                                                                                |
| --------- | --------------------------------------------------------------------------------------------------------------------- |
| Harbors   | Standard, 5-6, and Seafarers fixtures now attach only to coastal edges.                                               |
| Seafarers | Harbor tokens shuffle deterministically by seed across scenario slots.                                                |
| Map UI    | Resources, harbors, and neutral markers can be selected; repeated tap, empty board tap, and Clear Selection deselect. |
| Rules     | Setup notes cover two-player production rolls, neutral builds, harbor behavior, and expansion effects.                |
| Tests     | Domain tests guard coastal harbor slots and Seafarers shuffling; browser tests cover map selection.                   |

## Validation

| Command               | Result                                          |
| --------------------- | ----------------------------------------------- |
| `just check`          | Pass                                            |
| `just test`           | Pass                                            |
| `just test-honeycomb` | Pass after installing Playwright Chromium cache |
| `just ci`             | Pass                                            |

## Root Cause

Some harbor fixtures used valid hex row/column coordinates but non-coastal vertex edges, so the
renderer attached harbors toward interior edges. The new boundary-edge regression test prevents this
from recurring.

## Remaining Risk

Seafarers remains a single scenario-style generated layout, not a full scenario catalog.
