---
title: Harbour Coastal Regression Repair
date: 2026-07-21
last_updated: 2026-07-21T09:36:12Z
type: handover
status: done
---

# 1. Harbour Coastal Regression Repair

## 1.1 Result

Harbour tokens now attach only to exterior board edges and remain fully over water on standard,
compact, 5-6, and Seafarers layouts.

## 1.2 Evidence

| Item         | Result                                                                              |
| ------------ | ----------------------------------------------------------------------------------- |
| Root cause   | The test's copied vertex-direction table was rotated relative to SVG geometry.      |
| Reproduction | Correct geometry exposed standard `4:1:4-5` as shared with hex `4:0`.               |
| Repair       | Moved one standard, two 5-6, and one Seafarers fixture to exterior edges.           |
| Guardrail    | Domain checks use actual SVG coordinates; Playwright checks circle/polygon overlap. |
| Entry point  | Built app exercised all four layouts through browser URLs.                          |
| Validation   | `just test`, `just test-honeycomb`, and `just ci` passed.                           |

## 1.3 State

- Plan: `.plans/20260721-0932-done-harbor-coastal-regression.md`.
- Original paused-rebase worktree was preserved without edits.
- Remaining risk: exact physical-edition harbour spacing was intentionally not changed.
- Lesson: validate board fixtures against rendered coordinates, not a duplicated direction map.
