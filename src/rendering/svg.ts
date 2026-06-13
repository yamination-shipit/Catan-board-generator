import type { Challenge, Hex, Mode, Port, Variant } from "../types.ts";
import { getGhostSettlements } from "../domain/options.ts";
import { RESOURCES } from "../domain/rules.ts";
import { pipsForNumber } from "../domain/board.ts";
import { axialToPixel, generateHexRing, getVertexPosition, type Point } from "./geometry.ts";

export function renderBoardSvg(input: {
  readonly board: readonly Hex[];
  readonly mode: Mode;
  readonly variant: Variant;
  readonly challenges: readonly Challenge[];
  readonly ports: readonly Port[];
}): string {
  const hexSize = 60;
  const hexWidth = hexSize * Math.sqrt(3);
  const hexHeight = hexSize * 2;
  const ringRadius = Math.max(
    ...input.board.map((hex) =>
      Math.max(Math.abs(hex.q), Math.abs(hex.r), Math.abs(-hex.q - hex.r))
    ),
  ) + 1;
  const waterHexPositions = generateHexRing(ringRadius);
  const allPositions = [
    ...input.board.map((hex) => axialToPixel(hex.q, hex.r, hexSize)),
    ...waterHexPositions.map((hex) => axialToPixel(hex.q, hex.r, hexSize)),
  ];
  const minX = Math.min(...allPositions.map((point) => point.x));
  const maxX = Math.max(...allPositions.map((point) => point.x));
  const minY = Math.min(...allPositions.map((point) => point.y));
  const maxY = Math.max(...allPositions.map((point) => point.y));
  const portPad = input.variant.startsWith("compact") ? 64 : 80;
  const svgWidth = Math.ceil(maxX - minX + hexWidth + portPad * 2);
  const svgHeight = Math.ceil(maxY - minY + hexHeight + portPad * 2);
  const offsetX = portPad + hexWidth / 2 - minX;
  const offsetY = portPad + hexSize - minY;
  const center = createHexCenter(hexSize, offsetX, offsetY);

  const water = waterHexPositions.map((hex) =>
    renderWaterHex(hex.q, hex.r, hexSize, offsetX, offsetY)
  ).join("");
  const land = input.board.map((hex) => renderHex(center(hex), hexSize, hex)).join("");
  const ports = renderPorts(input.board, hexSize, center, input.ports);
  const ghosts = input.mode === "2"
    ? renderGhostSettlements(
      input.board,
      center,
      hexSize,
      input.mode,
      input.variant,
      input.challenges,
    )
    : "";

  return `<svg id="board-svg" viewBox="0 0 ${svgWidth} ${svgHeight}" width="${svgWidth}" height="${svgHeight}" role="img" aria-label="Generated Catan board">
<defs>
<radialGradient id="ocean-grad" cx="50%" cy="50%" r="55%"><stop offset="0%" stop-color="#4a90d9"/><stop offset="100%" stop-color="#1e3a5f"/></radialGradient>
<pattern id="wave-pattern" width="30" height="10" patternUnits="userSpaceOnUse"><path d="M0 5 Q7.5 0 15 5 Q22.5 10 30 5" stroke="#5ba0e8" stroke-width="0.8" fill="none" opacity="0.35"/></pattern>
</defs>
<rect x="0" y="0" width="${svgWidth}" height="${svgHeight}" fill="url(#ocean-grad)" rx="12"/>
<rect x="0" y="0" width="${svgWidth}" height="${svgHeight}" fill="url(#wave-pattern)" rx="12"/>
${water}${land}${ports}${ghosts}</svg>`;
}

function createHexCenter(hexSize: number, offsetX: number, offsetY: number): (hex: Hex) => Point {
  return (hex: Hex) => {
    const raw = axialToPixel(hex.q, hex.r, hexSize);
    return {
      x: raw.x + offsetX,
      y: raw.y + offsetY,
    };
  };
}

function renderWaterHex(
  q: number,
  r: number,
  size: number,
  offsetX: number,
  offsetY: number,
): string {
  const raw = axialToPixel(q, r, size);
  const x = raw.x + offsetX;
  const y = raw.y + offsetY;
  const points = hexPoints(x, y, size);
  return `<polygon points="${points}" fill="#3b7dd8" stroke="#2a5a9e" stroke-width="1.5" opacity="0.5"/>`;
}

function renderHex(center: Point, size: number, hex: Hex): string {
  const resource = RESOURCES[hex.resource];
  const number = hex.number;
  const pips = pipsForNumber(number);
  const token = number === null ? "" : renderNumberToken(center, number, pips);
  return `<g class="hex"><polygon points="${
    hexPoints(center.x, center.y, size)
  }" fill="${resource.color}" stroke="#263238" stroke-width="2" opacity="0.92"/>
<text x="${center.x}" y="${
    center.y - 12
  }" text-anchor="middle" font-size="13" fill="#111827" font-weight="700">${resource.shortLabel}</text>${token}</g>`;
}

function renderNumberToken(center: Point, number: number, pips: number): string {
  const isRed = number === 6 || number === 8;
  const tokenColor = isRed ? "#dc2626" : "#f3f4f6";
  const textColor = isRed ? "#ffffff" : "#1f2937";
  return `<circle cx="${center.x}" cy="${
    center.y + 20
  }" r="18" fill="${tokenColor}" stroke="#263238" stroke-width="2" class="token-circle"/>
<text x="${center.x}" y="${
    center.y + 20
  }" text-anchor="middle" font-size="18" font-weight="700" fill="${textColor}" dominant-baseline="middle">${number}</text>
<text x="${center.x}" y="${
    center.y + 35
  }" text-anchor="middle" font-size="10" fill="#4b5563" dominant-baseline="middle">${
    "*".repeat(pips)
  }</text>`;
}

function renderPorts(
  board: readonly Hex[],
  hexSize: number,
  hexCenter: (hex: Hex) => Point,
  ports: readonly Port[],
): string {
  return ports.map((port) => {
    const hex = board.find((candidate) =>
      candidate.row === port.hexRow && candidate.col === port.hexCol
    );
    if (!hex) return "";
    const center = hexCenter(hex);
    const v1 = getVertexPosition(center.x, center.y, hexSize, port.vertices[0]);
    const v2 = getVertexPosition(center.x, center.y, hexSize, port.vertices[1]);
    const mid = { x: (v1.x + v2.x) / 2, y: (v1.y + v2.y) / 2 };
    const dx = mid.x - center.x;
    const dy = mid.y - center.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const point = {
      x: mid.x + dx / length * 38,
      y: mid.y + dy / length * 38,
    };
    const isSpecialty = port.type !== "3:1";
    return `<line x1="${v1.x}" y1="${v1.y}" x2="${point.x}" y2="${point.y}" stroke="#8b6914" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/>
<line x1="${v2.x}" y1="${v2.y}" x2="${point.x}" y2="${point.y}" stroke="#8b6914" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/>
<circle cx="${v1.x}" cy="${v1.y}" r="3.5" fill="#8b6914" opacity="0.8"/>
<circle cx="${v2.x}" cy="${v2.y}" r="3.5" fill="#8b6914" opacity="0.8"/>
<circle cx="${point.x}" cy="${point.y}" r="20" fill="${
      isSpecialty ? "#fff7e6" : "#e6f0ff"
    }" stroke="${isSpecialty ? "#d4a017" : "#4a90d9"}" stroke-width="2.5"/>
<text x="${point.x}" y="${
      point.y - 5
    }" text-anchor="middle" font-size="10" font-weight="700" fill="#1f2937">${port.label}</text>
<text x="${point.x}" y="${
      point.y + 10
    }" text-anchor="middle" font-size="9" font-weight="700" fill="#1f2937">${port.shortLabel}</text>`;
  }).join("");
}

function renderGhostSettlements(
  board: readonly Hex[],
  hexCenter: (hex: Hex) => Point,
  hexSize: number,
  mode: Mode,
  variant: Variant,
  challenges: readonly Challenge[],
): string {
  return getGhostSettlements(mode, variant, challenges).map((ghost) => {
    const hex = board.find((candidate) =>
      candidate.row === ghost.hexRow && candidate.col === ghost.hexCol
    );
    if (!hex) return "";
    const center = hexCenter(hex);
    const vertex = getVertexPosition(center.x, center.y, hexSize, ghost.vertex);
    return `<circle cx="${vertex.x}" cy="${vertex.y}" r="8" fill="#4b5563" stroke="#ffffff" stroke-width="2" opacity="0.86"/>
<text x="${vertex.x}" y="${vertex.y}" text-anchor="middle" font-size="10" fill="#ffffff" dominant-baseline="middle" font-weight="700">N</text>`;
  }).join("");
}

function hexPoints(x: number, y: number, size: number): string {
  return Array.from({ length: 6 }, (_, index) => {
    const angle = Math.PI / 3 * index - Math.PI / 2;
    return `${x + size * Math.cos(angle)},${y + size * Math.sin(angle)}`;
  }).join(" ");
}
