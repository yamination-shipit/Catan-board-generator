# CLAUDE.md - Catan Board Generator

## Project Overview
A single-file web application that generates balanced, shareable Catan board configurations. Supports 3-4 player standard games and a 2-player variant with neutral settlements. Deployed via GitHub Pages.

## Architecture
- **Single-file app**: All HTML, CSS, and JavaScript lives in `index.html`
- **No build process**: Open `index.html` directly in a browser to run
- **No npm/node dependencies**: Uses Tailwind CSS via CDN
- **SVG rendering**: Board is drawn as inline SVG with zoom/pan support

## Key Concepts
- **Seeded RNG**: Linear congruential generator ensures reproducible boards from a seed string
- **Board balancing**: Generates up to 100 candidate boards and picks the highest-scoring one
- **Scoring criteria**: Penalizes adjacent 6/8 tiles, rewards even pip distribution and resource diversity
- **Hex grid**: Offset coordinate system (even/odd row offsets) with 19-hex standard Catan layout
- **Ports**: 9 harbors around the board edge (4 generic 3:1, 5 specialty 2:1) rendered as labeled circles outside the hex grid
- **Zoom/Pan**: Mouse wheel zoom, click-drag pan, pinch-zoom on mobile, plus button controls

## File Structure
```
index.html                      # Complete application (HTML + CSS + JS)
README.md                       # Project documentation
CLAUDE.md                       # This file - development guide
.gitignore                      # Git ignore rules
.github/workflows/static.yml    # GitHub Pages deployment workflow
```

## Development Commands
```bash
# Run locally - just open in browser
open index.html          # macOS
xdg-open index.html      # Linux

# No tests, linting, or build steps exist
```

## Code Layout (inside index.html)
- **Lines 1-70**: HTML structure, Tailwind CSS styles, zoom/pan CSS
- **Lines 140-230**: `SeededRandom` class, resource/number constants, board layout definitions, port definitions
- **Lines 230-310**: Event listeners, mode switching, URL loading, `generateBoard()`
- **Lines 310-420**: Board generation algorithm (`generateBalancedBoard`, `generateRandomBoard`, `evaluateBoard`)
- **Lines 420-600**: Rendering (`renderBoard`, `renderPorts`, `initZoom`, `renderHex`)
- **Lines 600+**: Stats, clipboard, notifications, hash utility

## Conventions
- Vanilla JavaScript only (no frameworks, no TypeScript)
- Tailwind CSS utility classes for styling
- All state is global (`currentMode`, `currentSeed`, `currentBoard`)
- SVG elements use string concatenation (no DOM API)
- Hex positions use row/col offset coordinates, not axial/cube

## Deployment
Pushes to `master` trigger the GitHub Actions workflow (`.github/workflows/static.yml`) which deploys to GitHub Pages automatically.
