# Handover

Current session state lives in dated files under `handover/`.

Before ending non-trivial work, update this file with the latest handover note and keep the active
`.plans/` file current.

Latest note: `handover/20260621-0854--resource-color-preferences.md`

Latest plan: `.plans/20260621-0848-done-resource-color-preferences.md`.

Current work restored wheat to `#f4c430` and added browser-local resource color preferences. Colors
are saved under `catan-board-resource-colors` in localStorage, affect rendering only, and are not
included in seed/share URLs. Full validation passed; the remaining follow-up risk is contrast for
user-selected colors.
