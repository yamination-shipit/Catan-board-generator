# Catan Board Generator

A balanced, shareable Catan board generator with a Deno/TypeScript core and automatic GitHub Pages
deployment.

## Features

### Game Modes

- **3-4 Players**: Standard 19-hex Catan board
- **2 Players**: Full and compact variants with optional neutral settlements

### Board Balancing

The generator uses intelligent algorithms to create balanced boards:

- ✅ No adjacent 6s and 8s (highest probability numbers)
- ✅ Even resource distribution across the board
- ✅ Balanced pip counts (probability distribution)
- ✅ Resource diversity in neighborhoods
- ✅ Per-board difficulty rating from 1-5

### Seed System

- Generate boards with seeds for reproducibility
- Share specific boards with friends via URL
- Copy seed or full URL to clipboard
- Save seed history locally in browser localStorage
- Copy/export all saved history entries with share URLs and metadata
- Toggle future expansion choices in share URLs without changing historical seed output

### Mobile Layout

- Board loads automatically on first page load
- Compact board-first layout keeps the whole board visible by default on mobile
- Collapsible setup, sharing, history, and statistics sections
- Fullscreen board mode with quick actions
- Light/dark theme toggle saved locally

### 2-Player Mode Setup

The 2-player mode supports multiple table setups:

- **Full board + neutral settlements**: 19 hexes with 8 neutral blockers
- **Full board, no neutral settlements**: 19 hexes with open expansion
- **Full board + extra neutral pressure**: 19 hexes with 12 neutral blockers
- **Compact duel**: 13-hex island with reduced numbers and ports
- **Compact tight**: compact island with neutral blockers

2-player rules can be selected separately from the board variant:

- **Balanced neutral setup**: neutral settlements and neutral road markers where the board shows
  them
- **Open duel**: normal starting placement with no neutral roads
- **Long game**: neutral markers with a 12-point victory target

**Setup Instructions:**

1. **Board**: Use the selected full or compact board shown in the app
2. **Neutral Settlements**: Place neutral/ghost settlements only when the selected variant marks
   gray "N" circles on vertices
3. **Neutral Roads**: Place neutral roads where the selected rules preset draws them
4. **Starting Placement**: Each player places 2 settlements and 2 roads after neutral settlements
   are placed
5. **Gameplay**: Neutral settlements block building but don't collect resources
6. **Victory**: Use the selected rules preset target

**Why Neutral Settlements?**

- Balances the game by limiting expansion options
- Prevents domination of resource-rich areas
- Creates strategic tension similar to 3-4 player games
- Standard competitive 2-player Catan variant

## Live Demo

Visit the live application at:

https://yamination-shipit.github.io/Catan-board-generator

## Local Development

Install Deno 2 and Just, then use the same commands locally that CI runs:

```bash
just setup
just ci
just build
just serve
just test-honeycomb
```

The source app lives in `src/`. `just build` generates the static site in `dist/`, and `just serve`
serves it at `http://127.0.0.1:8080`.

`just test-honeycomb` runs the longer browser behavior suite and is also available as a manual
GitHub Actions workflow. Local runs require a Playwright Chromium install:

```bash
deno run -A npm:playwright@1.52.0 install chromium
```

## Deployment

This project uses GitHub Actions to validate and deploy the generated `dist/` site to GitHub Pages
on every push to `master`.

### Setup Instructions

1. Push the code to GitHub
2. Go to repository Settings → Pages
3. Under "Build and deployment":
   - Source: Select "GitHub Actions"
4. The workflow will automatically deploy on the next push to main

## Technology Stack

- **Frontend**: TypeScript modules bundled by Deno
- **Styling**: Checked-in CSS, no runtime CSS CDN
- **Graphics**: Pure SVG rendering helpers for the game board
- **Tests**: Deno tests with behavior-driven names and AAA structure
- **CI/CD**: GitHub Actions, Release Please, Renovate
- **Hosting**: GitHub Pages

## Architecture

- `src/domain/`: pure board generation, scoring, options, ports, URLs, and history behavior
- `src/rendering/`: pure geometry and SVG helpers
- `src/app/`: immutable app state transitions
- `src/main.ts`: browser boundary for DOM, storage, clipboard, fullscreen, and URL effects
- `docs/adr/`: core architectural decisions, including seed compatibility rules

## Board Generation Algorithm

The generator creates multiple board variations and scores them based on:

1. High-number adjacency penalty (6s and 8s)
2. Pip distribution balance across resources
3. Resource diversity in hexagon neighborhoods

The best-scoring board is selected and rendered.

## License

MIT License - Feel free to use and modify!
