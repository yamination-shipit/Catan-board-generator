---
title: Harbour Coastal Regression Repair
date: 2026-07-21
last_updated: 2026-07-21T09:36:12Z
type: implementation-plan
status: done
---

# 1. Harbour Coastal Regression Repair

## 1.1 Result

Fixed four inland harbour fixtures and added geometry plus browser guardrails that keep harbour
tokens over water on every supported layout.

## 1.2 Implementation

| Layer         | Result                                                                              |
| ------------- | ----------------------------------------------------------------------------------- |
| Root cause    | Replaced the incorrect copied edge-direction table with rendered-coordinate checks. |
| Fixtures      | Corrected one standard, two 5-6, and one Seafarers harbour edge.                    |
| Guardrails    | Verify coastal attachment and exact SVG token-versus-board non-overlap.             |
| Compatibility | Preserved counts, types, seeded scrambling, URLs, and terrain generation.           |

## 1.3 Validation

| Command               | Result                                                                    |
| --------------------- | ------------------------------------------------------------------------- |
| Red reproduction      | Failed on standard `4:1:4-5`, which shared an edge with `4:0`.            |
| `just test`           | Passed, 27 tests.                                                         |
| `just test-honeycomb` | Passed, including all four harbour layouts.                               |
| `just ci`             | Passed.                                                                   |
| Visual review         | Standard, compact, 5-6, and Seafarers harbour tokens remained over water. |

## 1.4 Risk

No known residual harbour-overlap risk; edition-specific harbour spacing remains intentionally out
of scope.
