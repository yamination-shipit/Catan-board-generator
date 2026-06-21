# Resource Color Polish

## Summary

Add reset-to-defaults for browser resource colors and make board labels adapt to custom color
contrast.

## Completed

- Add a Reset Defaults button in the Resource Colors panel.
- Clear `catan-board-resource-colors`, reset all color inputs, and repaint the current board/stats.
- Derive board resource label and pip text colors from each rendered tile color.
- Keep number token colors unchanged except for pip contrast on the tile background.
- Extend domain and browser tests for contrast behavior and reset persistence.

## Validation

- Passed: `just check`
- Passed: `just test`
- Passed: `just test-honeycomb`
- Passed: `just ci`

## Risks

- Text contrast choices are simple black/white based on relative luminance, not a full theme system.
