---
title: Expansion Generation
date: 2026-06-15
last_updated: 2026-06-15T16:12:00Z
type: implementation-plan
status: planned
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

Add per-expansion domain tests for board size, resource counts, number counts, deterministic seeds,
ports, URL parsing, and difficulty scoring. Add browser tests for selecting each expansion and
loading shared expansion URLs.
