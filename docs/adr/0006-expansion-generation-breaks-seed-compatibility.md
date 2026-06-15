# ADR 0006: Expansion Generation Breaks Seed Compatibility

## Status

Accepted

## Context

ADR 0005 preserved historical seeds by treating expansion selections as metadata. The user has now
explicitly accepted seed-changing and breaking behavior so expansion toggles can produce different
boards.

Official expansion rules change the board surface:

- CATAN 5-6 uses 30 terrain hexes, CATAN 5-6 number tokens, and 11 harbor pieces.
- Seafarers scenarios use sea frame/sea hexes, scenario-defined hex layouts, and harbor token
  placement.
- Cities & Knights changes rules, components, production, and victory conditions, but does not
  require a different base terrain layout by itself.

## Decision

Expansion selections may now affect layout selection, resource and number distributions, ports,
scoring, rendered board geometry, URL behavior, and saved history output.

For this app:

- `five-six-players` selects a 30-hex expansion layout with 11 harbors.
- `seafarers` selects a scenario-style layout containing sea and gold hexes; if selected with 5-6,
  Seafarers owns the board layout and 5-6 remains a rules/player-count note for now.
- `cities-knights` keeps the selected terrain layout and adds C&K-specific rules/setup notes.
- Expansion choices remain explicit URL parameters, so old URLs without expansions still normalize
  to the existing default board path.

## Consequences

- Existing URLs that include expansion parameters can now generate different boards than they did
  under ADR 0005.
- Base-game URLs without expansion parameters continue to use the base layout path.
- Future expansion scenario work should add new layout keys and tests rather than overloading these
  v1 layouts silently.
