# ADR 0008: Make Board Edition Explicit

## Status

Accepted

## Context

The 5th edition base game supplies removable harbor tokens, while the 6th edition prints fixed
harbors on its sea frame. Treating both as one layout makes the rendered board disagree with the
physical components and allows an impossible harbor scramble for 6th edition owners.

## Decision

- Add `fifth` and `sixth` as explicit board editions, defaulting omitted values to `fifth` so old
  links and saved history retain their current harbor layout.
- Encode only the non-default choice as `edition=6` in share URLs.
- Use the fixed 6th edition base-frame harbor positions and types when selected, and disallow the
  removable-token harbor scramble for that frame.
- Keep edition selection from changing terrain resources, numbers, balance scoring, or seed RNG.
- Compact, 5-6, and Seafarers layouts remain app-specific scenarios and continue using their own
  harbor fixtures.

The component and fixed-setup references are the official 2020 5th edition and 2025 6th edition
CATAN rulebooks published at <https://www.catan.com/understand-catan/game-rules>.

## Consequences

- Shared boards reproduce the chosen physical base-game harbor frame.
- Existing URLs remain compatible.
- A future edition must add a named fixture and URL value rather than silently replacing a current
  layout.
