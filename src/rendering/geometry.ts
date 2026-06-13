export interface Point {
  readonly x: number;
  readonly y: number;
}

export function axialToPixel(q: number, r: number, size: number): Point {
  return {
    x: size * Math.sqrt(3) * (q + r / 2),
    y: size * 1.5 * r,
  };
}

export function generateHexRing(
  radius: number,
): readonly { readonly q: number; readonly r: number }[] {
  const positions: { readonly q: number; readonly r: number }[] = [];
  for (let q = -radius; q <= radius; q++) {
    for (let r = -radius; r <= radius; r++) {
      const s = -q - r;
      if (Math.max(Math.abs(q), Math.abs(r), Math.abs(s)) === radius) {
        positions.push({ q, r });
      }
    }
  }
  return positions;
}

export function getVertexPosition(
  hexX: number,
  hexY: number,
  hexSize: number,
  vertexIndex: number,
): Point {
  const angle = Math.PI / 3 * vertexIndex - Math.PI / 2;
  return {
    x: hexX + hexSize * Math.cos(angle),
    y: hexY + hexSize * Math.sin(angle),
  };
}
