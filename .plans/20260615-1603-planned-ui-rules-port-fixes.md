---
title: UI Rules And Port Fixes
date: 2026-06-15
last_updated: 2026-06-15T16:03:49Z
type: implementation-plan
status: planned
---

# 1. UI Rules And Port Fixes

## 1.1 Summary

Implement the reported Catan UI and rules fixes while preserving seed compatibility from ADR 0005.

## 1.2 Changes

| Area | Planned change |
| --- | --- |
| Ports | Use the official base-game harbor frame slots and keep Harbor Scramble as deterministic type shuffling over those slots. |
| Copying | Make top copy action copy the full canonical share URL; keep seed-only copying in the Seed & Share section. |
| Toggles | Make metadata-only expansions and context-specific controls visibly explain their effect. |
| Board UI | Make wheat white/near-white and add resource highlight from hexes and resource breakdown tiles. |
| Rules | Move 2-player setup, variant notes, expansion metadata, and active effects into a dedicated rules section. |

## 1.3 Validation

Run `just ci` after implementation. Add domain tests for ports/metadata and browser tests for copy,
collapse, toggle notes, and resource highlighting.

## 1.4 Risks

Official harbor slots need careful mapping to the existing row/column and vertex model. Expansion
generation remains out of scope unless a future ADR changes ADR 0005.
