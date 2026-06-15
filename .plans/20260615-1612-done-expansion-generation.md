---
title: Expansion Generation
date: 2026-06-15
last_updated: 2026-06-15T17:16:46Z
type: implementation-plan
status: done
---

# 1. Expansion Generation

## 1.1 Summary

Implement real expansion-aware board generation after the current UI/rules repair. This work may
intentionally break historical seed output, but must document that compatibility change before code
changes land.

## 1.2 Planned Work

| Expansion            | Planned behavior                                                                                                                       |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 5-6 player extension | Add a 30-hex layout, official 5-6 resource/number distributions, extra frame behavior, and larger SVG framing.                         |
| Seafarers            | Add scenario-backed layouts with sea hexes, harbor token placement, and pirate/ship setup notes where applicable.                      |
| Cities & Knights     | Keep base island generation unless paired with another expansion, but add C&K-specific rules/components notes and compatibility tests. |

## 1.3 Required Design Step

Create a new ADR before implementation. It must state how expansion selections affect RNG input,
layout selection, resource/number distributions, ports, scoring, URL compatibility, and old saved
history entries.

## 1.4 Validation

| Command               | Result                                     |
| --------------------- | ------------------------------------------ |
| `just check`          | Pass                                       |
| `just test`           | Pass, 18 domain tests                      |
| `just ci`             | Pass                                       |
| `just test-honeycomb` | Pass, browser expansion rendering coverage |

## 1.5 Result

V1 implements 5-6 and Seafarers as generation-changing layouts. Cities & Knights adds rules/setup
notes unless paired with another generation-changing expansion. ADR 0006 documents the accepted seed
compatibility break.
