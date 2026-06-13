# ADR 0005: Preserve Seeds When Adding Options

## Status

Accepted

## Context

Shared board URLs and saved history depend on seeds reproducing the same board. New options such as
expansion toggles and 2-player rule presets need to be shareable without accidentally changing old
boards.

## Decision

Treat expansion selections as additive metadata until a later ADR defines concrete generation rules
for an expansion. Omitted URL parameters normalize to current defaults. Do not add a new option to
RNG seed input, layout selection, distributions, ports, or scoring unless its ADR explicitly defines
the compatibility impact.

2-player rule presets may change setup instructions and overlay markers, but they do not change tile
generation or board scoring.

## Consequences

- Historical seed URLs continue to reproduce the same generated board.
- New share URLs can carry future-facing option choices without forcing expansion generation now.
- Each expansion that changes board generation needs its own ADR and compatibility tests.
