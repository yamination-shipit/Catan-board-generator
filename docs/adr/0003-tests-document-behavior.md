# ADR 0003: Tests Document Behavior

## Status

Accepted

## Context

Tests should make the project understandable, not just protect implementation details.

## Decision

Use behavior-driven test names in Roy Osherove style and keep Arrange/Act/Assert sections visible.
Focus on essential behaviors and stable snapshots where they clarify generated output.

## Consequences

- Reading tests should explain the project rules.
- Snapshot tests are limited to deterministic board and SVG output.
- Honeycomb/browser tests are reserved for behavior that cannot be covered cleanly through pure
  functions.
