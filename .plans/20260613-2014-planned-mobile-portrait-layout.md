# Mobile Portrait Layout

## Goal

Fix mobile portrait rendering so the page width matches the visual viewport, the board stays usable,
and touch interaction works without forcing a desktop-width layout.

## Plan

- Keep production dependencies unchanged; use CSS and native Pointer Events.
- Add shrink-safe CSS to the app grid, panels, board toolbar, and zoom wrapper.
- Add mobile portrait rules for single-column controls, stable board height, and stacked option grids.
- Replace mouse-only board panning with pointer-based pan plus two-pointer pinch zoom.
- Extend the Playwright honeycomb test to assert no horizontal overflow and basic pointer panning.
- Validate with `just check`, `just test`, `just test-honeycomb`, and `just ci`.

## Status

- Planned before implementation.
