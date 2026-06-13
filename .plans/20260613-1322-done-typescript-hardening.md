# TypeScript Hardening Plan

## Goal

Migrate the Catan Board Generator from a single inline JavaScript file to a Deno-first TypeScript
static app with a pure domain core, behavior-driven tests, core ADRs, PR CI, release automation,
Renovate cooldowns, and Termux Deno setup support.

## Implementation

- Split board generation, scoring, options, ports, URLs, history, and SVG helpers into TypeScript
  modules with immutable data and pure functions by default.
- Keep browser effects in a thin adapter for DOM, localStorage, clipboard, fullscreen, and URL
  history.
- Add Deno tasks, a Justfile, GitHub Actions CI/deploy/release workflows, Renovate, PR title checks,
  and version/hash rendering.
- Add focused behavior tests and a small snapshot coverage layer for stable board/SVG output.
- Add ADRs documenting TypeScript/Deno, pure core boundaries, tests as documentation, release
  automation, and supply-chain defaults.
- Update repo docs, handover notes, and Termux dotfiles setup guidance.

## Validation

- Deno 2.8.3 was installed locally at `/root/.deno/bin/deno` for validation.
- `deno check src/main.ts scripts/build.ts scripts/setup.ts scripts/serve.ts` passed.
- `deno test --allow-read` passed with 12 behavior tests.
- `just ci` passed: format check, lint, type-check, 12 behavior tests, and `deno bundle` build.
- Build generated `dist/index.html`, `dist/assets/app.css`, and `dist/assets/app.js`.
- `/termux-home/dotfiles/bin/setup-deno-termux` installed Deno 2.8.3 at
  `/termux-home/.deno/bin/deno`.
- Commit logical slices and push the completed branch.

## Progress

- Plan checkpoint committed.
- TypeScript source, Deno tasks, Justfile, behavior tests, ADRs, CI, Release Please, Renovate, and
  docs, and Termux Deno setup are implemented.

## Completion Notes

- `src/` is now canonical app source; `dist/` is generated and ignored.
- `index.html` remains as a lightweight local fallback that points to `dist/index.html`.
- Dotfiles changes are in `/termux-home/dotfiles`; the pre-existing dirty `home/.gitconfig` change
  was not touched.
