# UI Rules And Port Fixes

Plan: `.plans/20260615-1603-done-ui-rules-port-fixes.md`

Follow-up plan: `.plans/20260615-1612-planned-expansion-generation.md`

Branch: `codex/ui-rules-port-fixes`

## Summary

Fixed the reported UI and rules issues while keeping expansion generation metadata-only for this
pass. Added a separate plan for implementing real expansions later with an ADR that permits breaking
seed compatibility.

## Changed

| Area     | Result                                                                                                 |
| -------- | ------------------------------------------------------------------------------------------------------ |
| Ports    | Standard harbors now use official frame slots; Harbor Scramble still shuffles types deterministically. |
| Copying  | Top toolbar `Copy URL` copies the full share URL; seed-only copy moved to Seed & Share.                |
| Toggles  | 2-player-only controls disable with notes in 3-4 mode; expansions show metadata-only guidance.         |
| Board UI | Wheat is white; tapping hexes or resource breakdown tiles highlights matching resources.               |
| Rules    | Added a dedicated Rules & Setup section with active challenge/expansion notes.                         |

## Validation

| Command               | Result |
| --------------------- | ------ |
| `just check`          | Pass   |
| `just test`           | Pass   |
| `just test-honeycomb` | Pass   |
| `just ci`             | Pass   |

## Remaining Risk

Expansion generation remains intentionally deferred. Implement it from the follow-up plan after
creating a compatibility ADR.
