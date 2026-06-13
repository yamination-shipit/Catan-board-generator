# ADR 0001: Use Deno And TypeScript

## Status

Accepted

## Context

The app needs stronger testability, local/CI parity, and typed boundaries while remaining a static
GitHub Pages application.

## Decision

Use Deno 2 and TypeScript as the project platform. Build the browser app with `deno bundle`, run
checks with `deno fmt`, `deno lint`, `deno check`, and `deno test`, and expose commands through
`just`.

## Consequences

- CI and local validation run the same `just ci` path.
- The deployed app is still static HTML, CSS, and JavaScript under `dist/`.
- Node-only tooling is avoided unless Deno cannot cover a real need.
