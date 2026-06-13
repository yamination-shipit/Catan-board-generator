# ADR 0002: Keep The Domain Core Pure

## Status

Accepted

## Context

Board generation, scoring, ports, variants, share URLs, and seed history should be easy to reason
about and test.

## Decision

Favor pure functions and immutable data for core behavior. Mutations and effects belong in browser
adapters for DOM events, localStorage, clipboard, fullscreen, URL history, and notifications.

## Consequences

- Tests can document behavior without a browser for most logic.
- Domain modules stay usable from future UI layers.
- DDD names are used only where they clarify the model; simple data transformations win over
  unnecessary abstractions.
