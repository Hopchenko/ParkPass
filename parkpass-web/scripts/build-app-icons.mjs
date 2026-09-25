#!/usr/bin/env node
/**
 * Builds the native app icons: the Abisko artwork set into the same
 * gold-rimmed hexagon the apps draw for every pin
 * (docs/specs/design-system.md#pin-badge), on the paper ground.
 *
 * Android: the adaptive icon's foreground layer; its background layer is the
 * ground colour, defined in the app's resources.
 * iOS: one flattened 1024px icon (the App Store rejects alpha); iOS applies
 * its own rounded mask, so the hexagon keeps the same safe-zone sizing.
 *
 * Adaptive icons are 108dp with a 66dp safe zone that every launcher mask
 * (circle, squircle, teardrop) leaves visible, so the hexagon's circumradius
 * is sized to that zone. Written at xxxhdpi (4×) into drawable-nodpi, which
 * Android scales down for lower densities.
 *
 * Run: npm run build:icons:native
 */
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import sharp from "sharp";

const SOURCE = fileURLToPath(new URL("../../pin-images/abisko/final.png", import.meta.url));
const OUT = fileURLToPath(
  new URL(
    "../../android/app/src/main/res/drawable-nodpi/ic_launcher_foreground.png",
    import.meta.url,
  ),
);
const IOS_OUT = fileURLToPath(
  new URL(
    "../../ios/ParkPass/Assets.xcassets/AppIcon.appiconset/AppIcon.png",
    import.meta.url,
  ),
);

const SIZE = 432; // 108dp × 4
const C = SIZE / 2;
const RIM_R = 132; // 66dp safe zone ÷ 2 × 4
const ENAMEL_R = (RIM_R * 26) / 30; // same proportions as the 64-unit badge

function hex(r) {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 180) * (60 * i - 90);
    return `${(C + r * Math.cos(a)).toFixed(2)},${(C + r * Math.sin(a)).toFixed(2)}`;
  }).join(" ");
}

const artW = 2 * ENAMEL_R * Math.cos(Math.PI / 6);
const artH = 2 * ENAMEL_R;
const art = (await readFile(SOURCE)).toString("base64");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${SIZE}" height="${SIZE}">
  <defs>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fdf3cd"/>
      <stop offset="28%" stop-color="#e8c86e"/>
      <stop offset="55%" stop-color="#c2912c"/>
      <stop offset="80%" stop-color="#a5761f"/>
      <stop offset="100%" stop-color="#654613"/>
    </linearGradient>
    <clipPath id="enamel"><polygon points="${hex(ENAMEL_R)}"/></clipPath>
  </defs>
  <polygon points="${hex(RIM_R)}" fill="url(#gold)"/>
  <image xlink:href="data:image/png;base64,${art}" x="${C - artW / 2}" y="${C - artH / 2}"
    width="${artW}" height="${artH}" preserveAspectRatio="xMidYMid slice" clip-path="url(#enamel)"/>
  <polygon points="${hex(ENAMEL_R)}" fill="none" stroke="#855d18" stroke-width="${(0.7 * RIM_R) / 30}"/>
</svg>`;

const foreground = await sharp(Buffer.from(svg)).png().toBuffer();
await sharp(foreground).toFile(OUT);
console.log(`wrote ${OUT}`);

await sharp({ create: { width: 1024, height: 1024, channels: 3, background: "#f5ead8" } })
  .composite([{ input: await sharp(foreground).resize(1024, 1024).toBuffer() }])
  .removeAlpha()
  .png()
  .toFile(IOS_OUT);
console.log(`wrote ${IOS_OUT}`);
