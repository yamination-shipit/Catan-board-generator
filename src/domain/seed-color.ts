import { hashSeed } from "./rng.ts";

export function seedToHexColor(seed: string): string {
  const hue = hashSeed(seed) % 360;
  const saturation = 68;
  const lightness = 46;
  return hslToHex(hue, saturation, lightness);
}

function hslToHex(hue: number, saturationPercent: number, lightnessPercent: number): string {
  const saturation = saturationPercent / 100;
  const lightness = lightnessPercent / 100;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = chroma * (1 - Math.abs((hue / 60) % 2 - 1));
  const match = lightness - chroma / 2;
  const [redChannel, greenChannel, blueChannel] = hueToRgb(hue, chroma, x);
  const red = Math.round((redChannel + match) * 255);
  const green = Math.round((greenChannel + match) * 255);
  const blue = Math.round((blueChannel + match) * 255);
  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
}

function hueToRgb(hue: number, chroma: number, x: number): readonly [number, number, number] {
  if (hue < 60) return [chroma, x, 0];
  if (hue < 120) return [x, chroma, 0];
  if (hue < 180) return [0, chroma, x];
  if (hue < 240) return [0, x, chroma];
  if (hue < 300) return [x, 0, chroma];
  return [chroma, 0, x];
}

function toHex(value: number): string {
  return value.toString(16).padStart(2, "0");
}
