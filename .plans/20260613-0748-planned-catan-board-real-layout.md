# Catan Board Real Layout

Status: planned
Branch: `codex/catan-board-real-layout`

## Goal

Render generated boards like a physical Catan island while adding Codex workflow guardrails that use `CLAUDE.md` as the source of truth.

## Plan

- Keep `CLAUDE.md` canonical and add Codex-facing shims/skills that point back to it instead of duplicating project rules.
- Add a repository Codex skill that requires non-trivial work to start on a branch with a committed `.plans/` plan, and to finish with validation, handover, commit, and push.
- Update `index.html` so the board uses a centered 3-4-5-4-3 island geometry with ports and water arranged around the coastline.
- Preserve seeded generation, balancing, URL sharing, 2-player neutral settlements, zoom/pan, and direct browser opening.
- Preview the app on Android before pushing the finished branch.

## Validation

- `git status --short --branch` works after Termux safe-directory setup.
- Generate 3-4 player and 2-player boards in browser.
- Confirm the island shape is 3-4-5-4-3, ports sit around the coast, neutral settlements remain visible, and touch zoom/pan still works.
- Confirm seeded URL loading still regenerates a board.

## Completion

- Rename/update this plan to done when finished.
- Add or update handover notes before final commit.
- Commit logical slices and push the completed branch.
