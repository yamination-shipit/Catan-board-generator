# Catan Game Options And Seed History

Status: done
Branch: `codex/catan-game-options-history`

## Goal

Add richer board-generation controls while keeping the app single-file and direct-open compatible.

## Plan

- Committed the initial plan before implementation edits.
- Make the main Generate Board action create a new random seed and new board every click.
- Keep manual/shared seed loading available through a separate Load Seed action.
- Store generated/loaded seeds in local browser history with mode, variant, challenge, and timestamp.
- Add clickable seed-history entries that restore a previous seed and board.
- Make the 2-player setup instructions collapsible.
- Add 2-player variants, defaulting to the current full 19-hex board with neutral settlements.
- Add optional challenge toggles that alter setup/generation when enabled.

## Validation

- `node --check` passed for the inline JavaScript extracted from `index.html`.
- Node smoke confirmed tight 2-player variant with all challenges produces 12 neutral markers, 9 ports, 19 board hexes, and seed history entries.
- Local preview server responds at `http://127.0.0.1:8765/`.
- Local Android-accessible preview server responded at `http://127.0.0.1:8765/`.

## Completion

- Plan and handover updated.
- Branch pushed to `origin/codex/catan-game-options-history`.
