---
title: Harbour Edition Toggle
date: 2026-07-21
last_updated: 2026-07-21T10:07:31Z
type: handover
status: done
---

# 1. Harbour Edition Toggle

## 1.1 Result

Full base boards now support explicit 5th and 6th edition harbour layouts. The choice survives URLs
and history; custom compact and expansion layouts keep their scenario-specific harbours.

## 1.2 Evidence

| Item          | Result                                                                          |
| ------------- | ------------------------------------------------------------------------------- |
| Compatibility | Omitted edition defaults to 5th; explicit 6th uses `edition=6`.                 |
| 6th edition   | Uses fixed official frame positions/types and removes Harbor Scramble.          |
| UI            | Edition buttons, disabled-state guidance, rules copy, and history labels added. |
| Geometry      | Both editions pass coastal-edge and SVG circle/polygon overlap checks.          |
| Validation    | `just ci` and `just test-honeycomb` passed with Deno 2.9.3.                     |
| Visual review | 5th/6th boards and mobile controls reviewed in Chromium.                        |

## 1.3 State

- Plan: `.plans/20260721-0954-done-harbour-edition-toggle.md`.
- ADR: `docs/adr/0008-make-board-edition-explicit.md`.
- Immediate inland-harbour fix is already live at commit `4101196`.
- Original paused-rebase worktree remains untouched.
- Remaining risk: Release Please failed on the direct repair deployment; Pages and push CI passed.
