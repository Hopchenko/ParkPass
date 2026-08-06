#!/usr/bin/env node
/**
 * Rebuilds the PWA icons and the Open Graph image from the Abisko pin
 * artwork. Reads the 1024px source in ../pin-images (not the 360px served
 * webp, which would upscale) and writes:
 *
 *   public/icons/icon-192.png           launcher icon
 *   public/icons/icon-512.png           launcher icon
 *   public/icons/icon-180.png           apple-touch-icon
 *   public/icons/icon-512-maskable.png  artwork inset to the 80% safe area
 *   public/og.jpg                       1200x630 social card
 *
 * The icons stay PNG: palette-quantising them dithers the artwork's cream
 * linework, and they are fetched on install rather than per page load, so
 * the weight does not sit in the critical path. The OG card is JPEG — at
 * this size the wordmark shows no ringing, and it saves ~240KB on a file
 * every social scraper pulls.
 *
 * Run: npm run build:icons
 */
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const SOURCE = fileURLToPath(
  new URL("../../pin-images/abisko/final.png", import.meta.url),
);
const ICONS = new URL("../public/icons/", import.meta.url);
const OG = fileURLToPath(new URL("../public/og.jpg", import.meta.url));

const GROUND = "#f5ead8";
const INK = "#201e1d";
const MUTED = "#645c50";

await mkdir(ICONS, { recursive: true });

for (const size of [180, 192, 512]) {
  await sharp(SOURCE)
    .resize(size, size)
    .png()
    .toFile(fileURLToPath(new URL(`icon-${size}.png`, ICONS)));
}

// Maskable: launchers crop this to circles/squircles, so the artwork sits in
// the central 80% with the ground colour bleeding to every edge.
const inset = Math.round(512 * 0.8);
await sharp({
  create: { width: 512, height: 512, channels: 3, background: GROUND },
})
  .composite([
    {
      input: await sharp(SOURCE).resize(inset, inset).png().toBuffer(),
      gravity: "centre",
    },
  ])
  .png()
  .toFile(fileURLToPath(new URL("icon-512-maskable.png", ICONS)));

// OG card: pin artwork on the left, wordmark and Swedish tagline right.
// Text is SVG rendered by sharp; generic font stack keeps it portable.
const text = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="${GROUND}"/>
  <text x="620" y="295" font-family="Helvetica, Arial, sans-serif"
    font-size="104" font-weight="800" fill="${INK}">ParkPass</text>
  <text x="624" y="360" font-family="Helvetica, Arial, sans-serif"
    font-size="40" fill="${MUTED}">Krysslista för Sveriges</text>
  <text x="624" y="412" font-family="Helvetica, Arial, sans-serif"
    font-size="40" fill="${MUTED}">31 nationalparker</text>
</svg>`;

await sharp(Buffer.from(text))
  .composite([
    {
      input: await sharp(SOURCE).resize(470, 470).png().toBuffer(),
      left: 90,
      top: 80,
    },
  ])
  .jpeg({ quality: 90 })
  .toFile(OG);

console.log("Wrote 4 icons and og.jpg");
