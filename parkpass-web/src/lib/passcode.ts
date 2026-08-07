import { PARKS } from "@/data/parks";
import { todayISO, type VisitedMap } from "@/lib/visited";

/**
 * Transfer codes instead of accounts: the whole pin board packs into a string
 * you paste on another device. Nothing leaves the device, nothing to sign into.
 *
 * Layout, as a bit stream:
 *
 *   [4 bits version][W bits presence bitmap][14 bits × each set bit]
 *
 * The bitmap is positional over CODE_ORDER, then one day-offset per pinned
 * park in that same order. The stream is zero-padded to a multiple of 5,
 * Crockford-base32'd, and gets two checksum characters appended.
 */

/**
 * Frozen slug order — codes are positional, so this list is APPEND-ONLY.
 * Reordering or deleting an entry silently redirects every code already
 * written down to the wrong parks.
 */
export const CODE_ORDER = [
  "abisko",
  "vadvetjakka",
  "stora-sjofallet",
  "padjelanta",
  "sarek",
  "muddus",
  "pieljekaise",
  "haparanda-skargard",
  "bjornlandet",
  "skuleskogen",
  "sonfjallet",
  "tofsingdalen",
  "fulufjallet",
  "hamra",
  "farnebofjarden",
  "garphyttan",
  "tyresta",
  "angso",
  "namdoskargarden",
  "norra-kvill",
  "store-mosse",
  "bla-jungfrun",
  "gotska-sandon",
  "asnen",
  "stenshuvud",
  "dalby-soderskog",
  "soderasen",
  "kosterhavet",
  "tiveden",
  "djuro",
  "tresticklan",
] as const;

const VERSION = 1;
const VERSION_BITS = 4;

/**
 * Bitmap width per version. Sweden gaining a 32nd national park means adding
 * a version 2 entry here plus a branch in `decodeVisits` — never widening
 * version 1, which would misread every code already in the wild.
 */
const BITMAP_WIDTH: Record<number, number> = { 1: 31 };

const DATE_BITS = 14;
const MAX_DAY = (1 << DATE_BITS) - 1;
/** Reserved: "pinned, but the stored date was unreadable". */
const UNKNOWN_DAY = 0;
const EPOCH_UTC = Date.UTC(2020, 0, 1);
const DAY_MS = 86_400_000;

/** Crockford base32 — no I, L, O or U, so 1/I and 0/O can't be fat-fingered. */
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const PREFIX = "PARKPASS";
const CHECKSUM_CHARS = 2;
const CHECKSUM_BITS = 10;

const CHAR_VALUES = new Map<string, number>();
for (let i = 0; i < ALPHABET.length; i++) CHAR_VALUES.set(ALPHABET[i], i);
// Crockford's forgiving aliases for the characters it dropped.
CHAR_VALUES.set("O", 0);
CHAR_VALUES.set("I", 1);
CHAR_VALUES.set("L", 1);

const KNOWN_SLUGS = new Set(PARKS.map((p) => p.slug));

if (process.env.NODE_ENV !== "production") {
  if (CODE_ORDER.length !== BITMAP_WIDTH[VERSION]) {
    throw new Error(
      `passcode: CODE_ORDER has ${CODE_ORDER.length} entries but version ${VERSION} encodes ${BITMAP_WIDTH[VERSION]}. Add a new version rather than widening this one.`,
    );
  }
  const missing = PARKS.map((p) => p.slug).filter(
    (slug) => !(CODE_ORDER as readonly string[]).includes(slug),
  );
  if (missing.length) {
    throw new Error(
      `passcode: parks missing from CODE_ORDER: ${missing.join(", ")}. Append them and bump the code version.`,
    );
  }
}

function pushBits(bits: number[], value: number, width: number) {
  for (let i = width - 1; i >= 0; i--) bits.push((value >>> i) & 1);
}

function readBits(bits: number[], offset: number, width: number): number {
  let value = 0;
  for (let i = 0; i < width; i++) value = (value << 1) | bits[offset + i];
  return value;
}

/** CRC-16/CCITT-FALSE, over the code's own characters so the check is
 *  independent of the payload layout — a code from a future version still
 *  fails on its version, not on a bogus checksum. */
function crc16(values: number[]): number {
  let crc = 0xffff;
  for (const value of values) {
    crc ^= (value << 8) & 0xffff;
    for (let i = 0; i < 8; i++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc;
}

function dayFromISO(iso: string): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return UNKNOWN_DAY;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const utc = Date.UTC(y, mo - 1, d);
  // Rejects the likes of 2026-02-31, which Date.UTC would happily roll over.
  const rolled = new Date(utc);
  if (rolled.getUTCFullYear() !== y || rolled.getUTCMonth() !== mo - 1) {
    return UNKNOWN_DAY;
  }
  const day = Math.round((utc - EPOCH_UTC) / DAY_MS);
  return Math.min(MAX_DAY, Math.max(1, day));
}

function isoFromDay(day: number): string {
  if (day === UNKNOWN_DAY) return todayISO();
  return new Date(EPOCH_UTC + day * DAY_MS).toISOString().slice(0, 10);
}

/** Packs the visited map into a shareable code, grouped for readability. */
export function encodeVisits(visited: VisitedMap): string {
  const width = BITMAP_WIDTH[VERSION];
  const bits: number[] = [];
  pushBits(bits, VERSION, VERSION_BITS);

  const days: number[] = [];
  for (let i = 0; i < width; i++) {
    const iso = visited[CODE_ORDER[i]];
    const pinned = typeof iso === "string";
    bits.push(pinned ? 1 : 0);
    if (pinned) days.push(dayFromISO(iso));
  }
  for (const day of days) pushBits(bits, day, DATE_BITS);

  while (bits.length % 5) bits.push(0);

  const values: number[] = [];
  for (let i = 0; i < bits.length; i += 5) values.push(readBits(bits, i, 5));

  const checksum = crc16(values) & ((1 << CHECKSUM_BITS) - 1);
  values.push((checksum >> 5) & 31, checksum & 31);

  const body = values.map((v) => ALPHABET[v]).join("");
  return `${PREFIX}-${body.match(/.{1,4}/g)!.join("-")}`;
}

export type DecodeError =
  | "empty"
  | "charset"
  | "length"
  | "checksum"
  | "version";

export type DecodeResult =
  | { ok: true; visits: VisitedMap }
  | { ok: false; error: DecodeError };

/** Parses a pasted code. Tolerates lowercase, missing prefix, and any
 *  spacing or punctuation the user's clipboard picked up on the way. */
export function decodeVisits(raw: string): DecodeResult {
  const cleaned = raw.toUpperCase().replace(/[^0-9A-Z]/g, "");
  const body = cleaned.startsWith(PREFIX)
    ? cleaned.slice(PREFIX.length)
    : cleaned;

  if (!body) {
    if (!raw.trim()) return { ok: false, error: "empty" };
    // "PARKPASS-" on its own is a truncated code; anything else is not one.
    return { ok: false, error: cleaned ? "length" : "charset" };
  }

  const values: number[] = [];
  for (const ch of body) {
    const value = CHAR_VALUES.get(ch);
    if (value === undefined) return { ok: false, error: "charset" };
    values.push(value);
  }
  if (values.length <= CHECKSUM_CHARS) return { ok: false, error: "length" };

  const data = values.slice(0, -CHECKSUM_CHARS);
  const [hi, lo] = values.slice(-CHECKSUM_CHARS);
  const expected = crc16(data) & ((1 << CHECKSUM_BITS) - 1);
  if (((hi << 5) | lo) !== expected) return { ok: false, error: "checksum" };

  const bits: number[] = [];
  for (const value of data) pushBits(bits, value, 5);

  if (bits.length < VERSION_BITS) return { ok: false, error: "length" };
  const version = readBits(bits, 0, VERSION_BITS);
  const width = BITMAP_WIDTH[version];
  if (width === undefined) return { ok: false, error: "version" };
  if (bits.length < VERSION_BITS + width) return { ok: false, error: "length" };

  const pinned: string[] = [];
  for (let i = 0; i < width; i++) {
    if (bits[VERSION_BITS + i]) pinned.push(CODE_ORDER[i]);
  }

  let offset = VERSION_BITS + width;
  if (bits.length < offset + pinned.length * DATE_BITS) {
    return { ok: false, error: "length" };
  }

  const visits: VisitedMap = {};
  for (const slug of pinned) {
    const day = readBits(bits, offset, DATE_BITS);
    offset += DATE_BITS;
    // A park dropped from PARKS shouldn't resurrect itself in storage.
    if (KNOWN_SLUGS.has(slug)) visits[slug] = isoFromDay(day);
  }

  return { ok: true, visits };
}
