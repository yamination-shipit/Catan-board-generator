# 🎲 Catan Board Generator

A professional, balanced Catan board generator with automatic GitHub Pages deployment.

## Features

### Game Modes
- **3-4 Players**: Standard 19-hex Catan board
- **2 Players**: Full 19-hex board with 8 neutral settlements (ghost player variant)

### Board Balancing
The generator uses intelligent algorithms to create balanced boards:
- ✅ No adjacent 6s and 8s (highest probability numbers)
- ✅ Even resource distribution across the board
- ✅ Balanced pip counts (probability distribution)
- ✅ Resource diversity in neighborhoods

### Seed System
- Generate boards with seeds for reproducibility
- Share specific boards with friends via URL
- Copy seed or full URL to clipboard

### 2-Player Mode Setup
The 2-player mode uses the full 19-hex board with neutral settlements:

**Setup Instructions:**
1. **Board**: Use the standard 19-hex board (same as 3-4 players)
2. **Neutral Settlements**: Place 8 neutral/ghost settlements at the marked positions (shown as gray "N" circles on vertices)
3. **Starting Placement**: Each player places 2 settlements and 2 roads after neutral settlements are placed
4. **Gameplay**: Neutral settlements block building but don't collect resources
5. **Victory**: First to 10 points wins

**Why Neutral Settlements?**
- Balances the game by limiting expansion options
- Prevents domination of resource-rich areas
- Creates strategic tension similar to 3-4 player games
- Standard competitive 2-player Catan variant

## Live Demo

Visit the live application at: `https://[your-username].github.io/Catan-board-generator/`

## Local Development

Simply open `index.html` in a web browser. No build process required!

## Deployment

This project uses GitHub Actions to automatically deploy to GitHub Pages on every push to the main branch.

### Setup Instructions

1. Push the code to GitHub
2. Go to repository Settings → Pages
3. Under "Build and deployment":
   - Source: Select "GitHub Actions"
4. The workflow will automatically deploy on the next push to main

## Technology Stack

- **Frontend**: Vanilla JavaScript (no frameworks)
- **Styling**: Tailwind CSS (via CDN)
- **Graphics**: SVG for the game board
- **CI/CD**: GitHub Actions
- **Hosting**: GitHub Pages

## Board Generation Algorithm

The generator creates multiple board variations and scores them based on:
1. High-number adjacency penalty (6s and 8s)
2. Pip distribution balance across resources
3. Resource diversity in hexagon neighborhoods

The best-scoring board is selected and rendered.

## License

MIT License - Feel free to use and modify!
