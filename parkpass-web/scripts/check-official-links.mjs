#!/usr/bin/env node
/**
 * Checks every official sverigesnationalparker.se link (31 parks × sv/en).
 * The official site's slugs are irregular, so this guards against silent
 * link rot. Run: node scripts/check-official-links.mjs
 */
import { readFile } from "node:fs/promises";

const source = await readFile(
  new URL("../src/data/parks.ts", import.meta.url),
  "utf8",
);

const table = source.match(
  /const OFFICIAL_SLUGS[\s\S]*?^};$/m,
)?.[0];
if (!table) {
  console.error("Could not find OFFICIAL_SLUGS in src/data/parks.ts");
  process.exit(1);
}

const base = "https://www.sverigesnationalparker.se";
const entries = [
  ...table.matchAll(
    /"?([a-z-]+)"?:\s*\{\s*sv:\s*"([^"]+)",\s*en:\s*"([^"]+)",?\s*\}/g,
  ),
].map(([, slug, sv, en]) => ({ slug, sv, en }));

console.log(`Checking ${entries.length * 2} URLs for ${entries.length} parks…\n`);

let failures = 0;
for (const { slug, sv, en } of entries) {
  const urls = {
    sv: `${base}/sv/upptack-nationalparkerna/${sv}`,
    en: `${base}/en/parks/${en}`,
  };
  for (const [locale, url] of Object.entries(urls)) {
    let status;
    try {
      status = (await fetch(url, { redirect: "manual" })).status;
    } catch (error) {
      status = `ERR ${error.message}`;
    }
    const ok = status === 200;
    if (!ok) failures++;
    console.log(
      `${ok ? "  ok" : "FAIL"}  ${status}  ${slug} [${locale}]  ${ok ? "" : url}`,
    );
  }
}

console.log(
  failures === 0
    ? "\nAll official links are reachable."
    : `\n${failures} link(s) need attention.`,
);
process.exit(failures === 0 ? 0 : 1);
