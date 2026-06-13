# Catan Game Options And Seed History

Status: planned
Branch: `codex/catan-game-options-history`

## Goal

Add richer board-generation controls while keeping the app single-file and direct-open compatible.

## Plan

- Make the main Generate Board action create a new random seed and new board every click.
- Keep manual/shared seed loading available through a separate Load Seed action.
- Store generated/loaded seeds in local browser history with mode, variant, challenge, and timestamp.
- Add clickable seed-history entries that restore a previous seed and board.
- Make the 2-player setup instructions collapsible.
- Add 2-player variants, defaulting to the current full 19-hex board with neutral settlements.
- Add optional challenge toggles that alter setup/generation when enabled.

## Validation

- `node --check` on extracted inline JavaScript.
- Node/browser smoke for seed history state and generation behavior where feasible.
- Android browser preview before push.

## Completion

- Rename this plan to `done`, update handover, commit logical slices, and push the branch.
