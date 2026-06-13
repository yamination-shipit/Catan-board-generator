# TypeScript Hardening Handover

Plan: `.plans/20260613-1322-done-typescript-hardening.md`
Branch: `codex/catan-game-options-history`

## Summary

Migrated the app toward a Deno/TypeScript static build with pure domain modules, behavior tests,
core ADRs, CI, Release Please, Renovate, and Termux Deno setup support.

## Validation

- `just ci` passed.
- Build generated `dist/index.html`, `dist/assets/app.css`, and `dist/assets/app.js`.
- `/termux-home/dotfiles/bin/setup-deno-termux` installed Deno 2.8.3 at
  `/termux-home/.deno/bin/deno`.
- Dotfiles shell syntax checks passed for managed Bash and Zsh startup files.

## Notes

- `src/` is now canonical app source; `dist/` is generated and ignored.
- Tests in `tests/domain_behavior_test.ts` document the board, scoring, options, URL, history, and
  stable SVG behavior.
- Dotfiles has an unrelated pre-existing dirty `home/.gitconfig` change that should remain separate.
