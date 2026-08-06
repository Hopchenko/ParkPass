#!/usr/bin/env node
/**
 * Rebuilds public/pins/*.webp from the artwork sources in ../pin-images.
 *
 * The pin board renders all 31 pins at once, so this is the difference
 * between a ~5.4MB and a ~2.9MB page. Encoding is near-lossless rather than
 * lossy on purpose: the artwork's thin cream outlines sit on flat colour,
 * and WebP's chroma subsampling greys them out at any lossy quality —
 * visible at the size the detail page draws them. Near-lossless keeps the
 * worst channel error at 2/255 and still saves ~47%.
 *
 * Run: npm run build:pins
 */
import { readdir, mkdir, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const SOURCES = new URL("../../pin-images/", import.meta.url);
const OUT = new URL("../public/pins/", import.meta.url);

/** Matches the hexagon's rendered size on the park detail page at 2x. */
const SIZE = 360;

const slugs = (await readdir(SOURCES, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

await mkdir(OUT, { recursive: true });

let written = 0;
let bytes = 0;
const missing = [];

for (const slug of slugs) {
  const source = new URL(`${slug}/final.png`, SOURCES);
  try {
    await stat(source);
  } catch {
    missing.push(slug);
    continue;
  }

  const out = new URL(`${slug}.webp`, OUT);
  const { size } = await sharp(fileURLToPath(source))
    .resize(SIZE, SIZE, { fit: "inside", withoutEnlargement: true })
    .webp({ nearLossless: true, quality: 60, effort: 6 })
    .toFile(fileURLToPath(out));

  written += 1;
  bytes += size;
}

console.log(`Wrote ${written} pins, ${(bytes / 1024 / 1024).toFixed(2)}MB`);
if (missing.length) {
  console.log(`No final.png yet: ${missing.join(", ")}`);
}
