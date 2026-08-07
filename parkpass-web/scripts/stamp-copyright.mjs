#!/usr/bin/env node
/**
 * Stamps copyright and creator metadata into the PNG artwork, so ownership
 * travels with a file that has been downloaded and re-shared away from this
 * repository.
 *
 * Metadata is written by splicing PNG text chunks in beside the existing
 * ones — the image data is never decoded or re-encoded, so the artwork stays
 * bit-for-bit identical and the files stay reproducible. Each run replaces
 * the chunks it wrote last time, so it is safe to re-run after adding pins.
 *
 * Both the standard tEXt keywords (which every image viewer reads) and an
 * XMP packet (which Adobe tools, Finder and most CMSes read) are written.
 *
 * Run: npm run stamp:copyright
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { HOLDER, NOTICE, RIGHTS, SOURCE, xmpPacket } from "./copyright.mjs";

/** Directories searched for .png files, relative to the repo root. */
const ROOTS = ["pin-images", "design", "parkpass-web/public/pins"];

const REPO = new URL("../../", import.meta.url);
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const XMP_KEYWORD = "XML:com.adobe.xmp";

/** tEXt keywords this script owns — cleared before rewriting so re-runs
 *  update rather than accumulate duplicates. */
const OWNED = new Set(["Author", "Copyright", "Disclaimer", "Source"]);

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function chunk(type, data) {
  const body = Buffer.concat([Buffer.from(type, "latin1"), data]);
  const out = Buffer.alloc(body.length + 8);
  out.writeUInt32BE(data.length, 0);
  body.copy(out, 4);
  out.writeUInt32BE(crc32(body), body.length + 4);
  return out;
}

const textChunk = (keyword, value) =>
  chunk("tEXt", Buffer.concat([
    Buffer.from(keyword, "latin1"),
    Buffer.from([0]),
    Buffer.from(value, "latin1"),
  ]));

/** iTXt carrying an uncompressed, unlocalised XMP packet. */
const xmpChunk = (xml) =>
  chunk("iTXt", Buffer.concat([
    Buffer.from(XMP_KEYWORD, "latin1"),
    Buffer.from([0, 0, 0, 0, 0]), // null, compression flag, method, lang, translated keyword
    Buffer.from(xml, "utf8"),
  ]));

/** Splits a PNG into its chunks, dropping any this script previously wrote. */
function parse(buf, file) {
  if (!buf.subarray(0, 8).equals(PNG_SIGNATURE)) {
    throw new Error(`not a PNG: ${file}`);
  }
  const kept = [];
  let offset = 8;
  while (offset < buf.length) {
    const length = buf.readUInt32BE(offset);
    const type = buf.toString("latin1", offset + 4, offset + 8);
    const end = offset + 12 + length;
    if (end > buf.length) throw new Error(`truncated chunk in ${file}`);

    let drop = false;
    if (type === "tEXt" || type === "iTXt") {
      const data = buf.subarray(offset + 8, offset + 8 + length);
      const keyword = data.subarray(0, data.indexOf(0)).toString("latin1");
      drop = OWNED.has(keyword) || keyword === XMP_KEYWORD;
    }
    if (!drop) kept.push({ type, raw: buf.subarray(offset, end) });

    offset = end;
    if (type === "IEND") break;
  }
  return kept;
}

async function* pngs(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return; // Optional directory (public/pins is generated).
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* pngs(full);
    else if (entry.name.toLowerCase().endsWith(".png")) yield full;
  }
}

const root = fileURLToPath(REPO);
let stamped = 0;

for (const rel of ROOTS) {
  for await (const file of pngs(path.join(root, rel))) {
    const buf = await readFile(file);
    const chunks = parse(buf, file);

    // Metadata chunks are legal anywhere between IHDR and IEND; placing them
    // right after IHDR means readers see them without scanning the pixels.
    const at = chunks.findIndex((c) => c.type === "IHDR") + 1;
    const title = `ParkPass — ${path.basename(path.dirname(file))}/${path.basename(file, ".png")}`;
    const inserted = [
      textChunk("Author", HOLDER),
      textChunk("Copyright", NOTICE),
      textChunk("Disclaimer", RIGHTS),
      textChunk("Source", SOURCE),
      xmpChunk(xmpPacket(title)),
    ];

    await writeFile(file, Buffer.concat([
      PNG_SIGNATURE,
      ...chunks.slice(0, at).map((c) => c.raw),
      ...inserted,
      ...chunks.slice(at).map((c) => c.raw),
    ]));
    stamped += 1;
  }
}

console.log(`Stamped ${stamped} PNGs — ${NOTICE}`);
