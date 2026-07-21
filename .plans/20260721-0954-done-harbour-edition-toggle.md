---
title: Harbour Edition Toggle
date: 2026-07-21
last_updated: 2026-07-21T10:07:31Z
type: implementation-plan
status: done
---

# 1. Harbour Edition Toggle

## 1.1 Goal

Add a shareable 5th/6th edition control for the full base board, with edition-specific harbour slots
and fixed-versus-removable harbour behavior.

## 1.2 Changes

| Area         | Change                                                                               |
| ------------ | ------------------------------------------------------------------------------------ |
| Domain       | Add a default-preserving edition selection and 6th edition fixed-frame port fixture. |
| UI           | Add 5th/6th edition buttons and explain when custom layouts override them.           |
| URLs/history | Persist explicit 6th edition choices while old links remain 5th edition.             |
| Rules        | Disable harbour scrambling for the 6th edition fixed frame.                          |
| Guardrails   | Validate both editions' coastal geometry, SVG overlap, state, URLs, and controls.    |

## 1.3 Validation

- `just test`
- `just test-honeycomb`
- `just ci`

## 1.4 Result

Implemented and fully validated with Deno 2.9.3. The 5th edition remains the compatible default; the
6th edition uses its fixed frame and disables harbor scrambling on full base boards.
