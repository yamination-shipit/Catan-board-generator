# CLAUDE.md - Catan Board Generator

## Project Overview

A Deno/TypeScript static web application that generates balanced, shareable Catan board
configurations. Supports 3-4 player standard games and 2-player variants with optional neutral
settlements. Deployed via GitHub Pages from generated `dist/` output.

## Architecture

- **TypeScript app**: Source lives under `src/` and is bundled with Deno.
- **Pure domain core**: Board generation, scoring, options, URLs, history, and SVG helpers are pure
  where practical.
- **Browser boundary**: DOM, localStorage, clipboard, fullscreen, and history mutations live in
  `src/main.ts`.
- **No production dependencies**: Uses Deno tooling and checked-in CSS.
- **SVG rendering**: Board is drawn as inline SVG with zoom/pan support.

## Key Concepts

- **Seeded RNG**: Pure linear congruential generator ensures reproducible boards from a seed string.
- **Board balancing**: Generates up to 100 candidate boards and picks the highest-scoring one.
- **Scoring criteria**: Penalizes adjacent 6/8 tiles, rewards even pip distribution and resource
  diversity.
- **Hex grid**: Row/col display positions plus axial q/r coordinates.
- **Ports**: Harbors are rendered outside the board edge and can be seed-shuffled by challenge mode.
- **Version metadata**: Footer links the displayed semver and git hash to GitHub releases and
  commits.

## File Structure

```text
src/                            # TypeScript source
src/domain/                     # Pure board domain logic
src/rendering/                  # Pure SVG/geometry helpers
src/app/                        # Immutable app state transitions
scripts/                        # Deno build/setup/serve scripts
tests/                          # Behavior-driven Deno tests
docs/adr/                       # Core architecture decision records
index.html                      # Source fallback that points to dist after build
README.md                       # Project documentation
CLAUDE.md                       # This file - development guide
.github/workflows/              # CI, Pages deploy, PR title, Release Please
```

## Development Commands

```bash
just setup               # Verify local tooling
just check               # Format check, lint, and type-check
just test                # Run behavior tests
just build               # Generate dist/
just ci                  # Run the same validation path as PR CI
just serve               # Build and serve dist/ on localhost:8080
```

## Testing

- Tests use Roy Osherove-style behavior names and Arrange/Act/Assert comments.
- Tests are intended to document core behavior, not every UI class.
- Snapshot-style checks are limited to stable board summaries and SVG shape.

## Conventions

- Prefer pure functions, immutable data, and narrow interfaces.
- Push mutations to browser boundaries.
- Use DDD names only where they clarify the model; prefer simple data transformations when in
  conflict.
- Avoid dependencies unless a concrete need justifies them.
- Keep generated workflow docs concise.
- Do not make a landing page; this repo is a direct-use app.

## Workflow

- Always commit and push when done with a task, unless explicitly instructed otherwise.
- For non-trivial work, create and maintain a `.plans/` file.
- Run `just ci` before completing implementation work.

## Deployment

Pushes to `master` trigger CI, Release Please, and GitHub Pages deployment. Pages deploy builds and
uploads `dist/`.
