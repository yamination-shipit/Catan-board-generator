# Board-First Mobile UX

## Task

Implemented board-first mobile UX improvements, expanded 2-player variants, difficulty ratings, local seed history sharing, fullscreen board controls, and persisted dark mode.

## Files Changed

- `index.html`: board-first layout, collapsible sections, fullscreen, dark mode, compact 2-player variants, difficulty rating, localStorage safety, bulk seed history export.
- `README.md`: feature and 2-player mode documentation.
- `.plans/20260613-1204-done-board-first-mobile-ux.md`: completed implementation plan and validation state.

## Validation

- Inline JavaScript syntax check passed.
- Node smoke test passed for full tight and compact tight 2-player variants.
- Local static server returned `200 OK` at `http://127.0.0.1:8765/`.

## Notes

- Seed history and UI preferences use localStorage, not cookies.
- Existing history entries without difficulty metadata remain displayable and shareable.
- No browser automation was installed locally; validation used static serving plus JS smoke checks.
