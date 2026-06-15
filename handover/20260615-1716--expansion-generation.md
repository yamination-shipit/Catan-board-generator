# Expansion Generation

Plan: `.plans/20260615-1612-done-expansion-generation.md`

ADR: `docs/adr/0006-expansion-generation-breaks-seed-compatibility.md`

Branch: `codex/expansion-generation`

## Summary

Implemented generation-changing expansion toggles after the user accepted breaking seed behavior.
This branch builds on `codex/ui-rules-port-fixes`.

## Changed

| Area                 | Result                                                                      |
| -------------------- | --------------------------------------------------------------------------- |
| 5-6 player extension | Adds a 30-hex layout, expanded resource/number counts, and 11 harbor slots. |
| Seafarers            | Adds sea and gold resources plus a scenario-style 37-hex layout.            |
| Cities & Knights     | Adds C&K setup/rules notes without changing terrain alone.                  |
| Compatibility        | ADR 0006 supersedes ADR 0005 for explicit expansion parameters.             |
| UI/tests             | Rules copy and browser tests now expect expansion generation.               |

## Validation

| Command               | Result |
| --------------------- | ------ |
| `just check`          | Pass   |
| `just test`           | Pass   |
| `just ci`             | Pass   |
| `just test-honeycomb` | Pass   |

## Remaining Risk

Seafarers is a v1 scenario-style generator, not a full catalog of every official scenario map.
Future work should add named scenarios as separate layout keys and tests.
