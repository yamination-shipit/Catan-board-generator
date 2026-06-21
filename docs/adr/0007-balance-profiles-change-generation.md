# ADR 0007: Balance Profiles Change Generation When Explicitly Selected

## Status

Accepted

## Context

The app needs smarter board options without breaking existing shared links. The current generator
uses a fixed candidate count and scoring profile, which makes every seed deterministic but leaves no
room for users who want stricter fairness or swingier boards.

## Decision

Add an explicit `balance` URL option with three profiles:

- `classic` is the default and preserves the existing generation path.
- `strict` searches more candidates and weighs high-number separation and pip balance more heavily.
- `wild` searches fewer candidates and lowers balance penalties while still using deterministic
  seeded generation.

Omitted `balance` parameters normalize to `classic`. Only non-classic profiles are written to share
URLs.

## Consequences

- Existing links without `balance` continue to produce classic boards.
- Links with `balance=strict` or `balance=wild` intentionally produce different boards for the same
  seed.
- Future generation profiles must remain explicit URL options with compatibility tests.
