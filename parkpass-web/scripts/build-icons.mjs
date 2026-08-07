#!/usr/bin/env node
/**
 * Rebuilds the PWA icons, the favicon and the Open Graph image from the
 * Abisko pin artwork. Reads the 1024px source in ../pin-images (not the
 * 360px served webp, which would upscale) and writes:
 *
 *   public/icons/icon-192.png           launcher icon
 *   public/icons/icon-512.png           launcher icon
 *   public/icons/icon-180.png           apple-touch-icon
 *   public/icons/icon-512-maskable.png  artwork inset to the 80% safe area
 *   src/app/favicon.ico                 16/32/48, hexagonal, gold rim
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
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const SOURCE = fileURLToPath(
  new URL("../../pin-images/abisko/final.png", import.meta.url),
);
const ICONS = new URL("../public/icons/", import.meta.url);
const OG = fileURLToPath(new URL("../public/og.jpg", import.meta.url));
const FAVICON = fileURLToPath(new URL("../src/app/favicon.ico", import.meta.url));

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

// Favicon: the hexagon is drawn here rather than baked into the artwork,
// mirroring PinBadge.tsx (64x64 viewBox, pointy-top, rim r=30, enamel r=26) so
// the browser tab carries the same shape as the pins in the app. The gold
// stops are the --color-gold-* tokens from globals.css, inlined because a
// standalone SVG has no custom properties to resolve.
const VIEW = 64;
// PinBadge uses r=30 inside a 64 box, which leaves padding that a browser tab
// cannot afford — a favicon is already tiny. Scaling to r=31.5 puts the
// hexagon's points a hair inside the edge, so the tile is filled without the
// anti-aliased tips clipping.
const RIM_R = 31.5;
const ENAMEL_R = RIM_R * (26 / 30);

const hex = (r) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 180) * (60 * i - 90);
    return `${(32 + r * Math.cos(a)).toFixed(2)},${(32 + r * Math.sin(a)).toFixed(2)}`;
  }).join(" ");

/** Bounding box of the enamel hexagon — artwork is cropped to cover it. */
const art = {
  x: 32 - ENAMEL_R * Math.cos(Math.PI / 6),
  y: 32 - ENAMEL_R,
  w: 2 * ENAMEL_R * Math.cos(Math.PI / 6),
  h: 2 * ENAMEL_R,
};

/**
 * The favicon crops into the artwork instead of showing all of it. At 16px the
 * full scene — aurora, moon, ridgeline and trail — is more detail than 256
 * pixels can hold and reads as noise. Zooming in trades detail for legible
 * shapes; 1.5x keeps the moon and the aurora band readable while leaving the
 * ridgeline in frame, where 2x cropped the composition down to two elements.
 */
const FAVICON_ZOOM = 1.5;
const sourceMeta = await sharp(SOURCE).metadata();
const FAVICON_CROP = (() => {
  const aspect = art.w / art.h;
  // Largest centred rect matching the art box's aspect, then zoomed into.
  const w = Math.min(sourceMeta.width, sourceMeta.height * aspect) / FAVICON_ZOOM;
  const h = w / aspect;
  return {
    left: Math.round((sourceMeta.width - w) / 2),
    top: Math.round((sourceMeta.height - h) / 2),
    width: Math.round(w),
    height: Math.round(h),
  };
})();

const badgeSvg = (px, artBase64) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 ${VIEW} ${VIEW}">
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
  <image href="data:image/png;base64,${artBase64}"
    x="${art.x}" y="${art.y}" width="${art.w}" height="${art.h}"
    preserveAspectRatio="none" clip-path="url(#enamel)"/>
  <polygon points="${hex(ENAMEL_R)}" fill="none" stroke="#855d18" stroke-width="0.7"/>
</svg>`;

/**
 * Each size is rendered from the vector at its final dimensions rather than
 * downsampled from one master. At 16px that is the difference between a
 * readable hexagon and a blob: downscaling a 512px raster smears the rim and
 * rounds off the points, while rendering at 16 anti-aliases the polygon edges
 * against the real pixel grid.
 */
async function badgeAt(px) {
  const supersample = 4;
  const artPng = await sharp(SOURCE)
    .extract(FAVICON_CROP)
    // Resizing the crop to the art box's exact aspect lets the SVG place it
    // with preserveAspectRatio="none" — relying on the renderer to implement
    // "slice" is what differs between resvg and librsvg.
    .resize(
      Math.max(2, Math.round((art.w * px * supersample) / VIEW)),
      Math.max(2, Math.round((art.h * px * supersample) / VIEW)),
      { fit: "fill" },
    )
    .png()
    .toBuffer();
  return sharp(Buffer.from(badgeSvg(px, artPng.toString("base64"))))
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/** Packs PNGs into an ICO container — PNG-in-ICO, read by every current browser. */
function ico(entries) {
  const dir = Buffer.alloc(6 + 16 * entries.length);
  dir.writeUInt16LE(1, 2); // type: icon
  dir.writeUInt16LE(entries.length, 4);
  let offset = dir.length;
  entries.forEach(({ size, data }, i) => {
    const at = 6 + 16 * i;
    dir.writeUInt8(size >= 256 ? 0 : size, at);
    dir.writeUInt8(size >= 256 ? 0 : size, at + 1);
    dir.writeUInt16LE(1, at + 4); // colour planes
    dir.writeUInt16LE(32, at + 6); // bits per pixel
    dir.writeUInt32LE(data.length, at + 8);
    dir.writeUInt32LE(offset, at + 12);
    offset += data.length;
  });
  return Buffer.concat([dir, ...entries.map((e) => e.data)]);
}

await writeFile(
  FAVICON,
  ico(
    await Promise.all(
      [16, 32, 48].map(async (size) => ({ size, data: await badgeAt(size) })),
    ),
  ),
);

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

console.log("Wrote 4 icons, favicon.ico (16/32/48) and og.jpg");
