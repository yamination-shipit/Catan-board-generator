# Mobile Portrait Layout

## Task

Fix mobile portrait rendering that forced a desktop-width page and made the board janky to use.

## Changes

- Added shrink-safe CSS so the board SVG cannot force main panels wider than the viewport.
- Added mobile portrait rules for the header actions, board toolbar, board actions, option grids,
  stats, and viewport-height board wrapper.
- Replaced mouse-only board drag with Pointer Events, including touch drag and two-pointer pinch.
- Added honeycomb browser assertions for no horizontal overflow, panel viewport fit, board fit, and
  pointer panning.
- Ran `deno fmt` on `CHANGELOG.md` because `just check` failed on an existing formatted-line issue.

## Validation

- `just check`
- `just test`
- `just test-honeycomb`
- `just ci`
- Manual Pixel 5 Chromium render confirmed `clientWidth`, document `scrollWidth`, and body
  `scrollWidth` were all `393px`.

## State

- Plan: `.plans/20260613-2014-done-mobile-portrait-layout.md`.
- Branch: `codex/mobile-portrait-layout`.
- Remaining risk: only Chromium was exercised locally; physical mobile browser testing would still
  be useful before release if available.
