# TypeScript Hardening Plan

## Goal

Migrate the Catan Board Generator from a single inline JavaScript file to a Deno-first TypeScript static app with a pure domain core, behavior-driven tests, core ADRs, PR CI, release automation, Renovate cooldowns, and Termux Deno setup support.

## Implementation

- Split board generation, scoring, options, ports, URLs, history, and SVG helpers into TypeScript modules with immutable data and pure functions by default.
- Keep browser effects in a thin adapter for DOM, localStorage, clipboard, fullscreen, and URL history.
- Add Deno tasks, a Justfile, GitHub Actions CI/deploy/release workflows, Renovate, PR title checks, and version/hash rendering.
- Add focused behavior tests and a small snapshot coverage layer for stable board/SVG output.
- Add ADRs documenting TypeScript/Deno, pure core boundaries, tests as documentation, release automation, and supply-chain defaults.
- Update repo docs, handover notes, and Termux dotfiles setup guidance.

## Validation

- Run `just ci` once Deno setup is available.
- Verify generated `dist/` contains the static app entrypoint and metadata.
- Commit logical slices and push the completed branch.
