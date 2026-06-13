# Catan Board Real Layout

Status: done Branch: `codex/catan-board-real-layout`

## Goal

Render generated boards like a physical Catan island while adding Codex workflow guardrails that use
`CLAUDE.md` as the source of truth.

## Plan

- Committed the initial `.plans/` file before implementation edits.
- Keep `CLAUDE.md` canonical and add Codex-facing shims/skills that point back to it instead of
  duplicating project rules.
- Add a repository Codex skill that requires non-trivial work to start on a branch with a committed
  `.plans/` plan, and to finish with validation, handover, commit, and push.
- Update `index.html` so the board uses a centered 3-4-5-4-3 island geometry with ports and water
  arranged around the coastline.
- Preserve seeded generation, balancing, URL sharing, 2-player neutral settlements, zoom/pan, and
  direct browser opening.
- Preview the app on Android before pushing the finished branch.

## Validation

- `git status --short --branch` works after Termux safe-directory setup.
- `quick_validate.py .codex/skills/catan-workflow` attempted; blocked by missing `PyYAML` in this
  environment, so the skill structure was manually inspected.
- `node --check` passed for the inline JavaScript extracted from `index.html`.
- Node runtime smoke confirmed rows `3-4-5-4-3`, 19 land tiles, 9 ports, 18 water-ring tiles, and 6
  center neighbors.
- Android preview approved by the user.

## Completion

- Plan and handover updated.
- Branch pushed to `origin/codex/catan-board-real-layout`.
