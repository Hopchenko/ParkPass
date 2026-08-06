export type Glyph = "mtn" | "pine" | "wave" | "leaf" | "sun";

export type Localized = { en: string; sv: string };

export type Park = {
  slug: string;
  name: string;
  sami?: string;
  year: number;
  /** Area in km². */
  area: number;
  glyph: Glyph;
  /** Index into COLORS — rotating placeholder-pin palette. */
  color: number;
  region: Localized;
  description: Localized;
};

/** Lucide-style compound paths for the placeholder pin glyphs (24×24 grid). */
export const GLYPHS: Record<Glyph, string> = {
  mtn: "m8 3 4 8 5-5 5 15H2L8 3z",
  pine: "M17 14l3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h-.3a1 1 0 0 1-.7-1.7L9 9h-.2A1 1 0 0 1 8 7.3L12 3l4 4.3a1 1 0 0 1-.8 1.7H15l3 3.3a1 1 0 0 1-.7 1.7H17Z M12 22v-3",
  wave: "M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1",
  leaf: "M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12",
  sun: "M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M12 2v2 M12 20v2 M4.93 4.93l1.41 1.41 M17.66 17.66l1.41 1.41 M2 12h2 M20 12h2 M6.34 17.66l-1.41 1.41 M19.07 4.93l-1.41 1.41",
};

export const COLORS = [
  { main: "#c67139", light: "#ffe1d0", dark: "#8c491a" },
  { main: "#7a8a5e", light: "#e1eecc", dark: "#3d472b" },
  { main: "#d67f48", light: "#fff2eb", dark: "#8c491a" },
  { main: "#8fa073", light: "#f0fae1", dark: "#3d472b" },
  { main: "#b2622d", light: "#ffc6a5", dark: "#643312" },
  { main: "#56633f", light: "#ccdbb2", dark: "#272e1b" },
] as const;

/**
 * Path segments on sverigesnationalparker.se, per locale. Swedish uses genitive
 * forms ("tivedens") and English doesn't, and the three parks with Sámi names
 * concatenate both — so these are transcribed from the official site's own
 * listings rather than derived. Verified with scripts/check-official-links.sh.
 */
const OFFICIAL_SLUGS: Record<string, { sv: string; en: string }> = {
  abisko: { sv: "abisko-nationalpark", en: "abisko-national-park" },
  vadvetjakka: { sv: "vadvetjakka-nationalpark", en: "vadvetjakka-national-park" },
  "stora-sjofallet": {
    sv: "stora-sjofalletsstuor-muorkke-nationalpark",
    en: "stora-sjofalletstuor-muorkke-national-park",
  },
  padjelanta: {
    sv: "padjelantabadjelannda-nationalpark",
    en: "padjelantabadjelannda-national-park",
  },
  sarek: { sv: "sarek-nationalpark", en: "sarek-national-park" },
  muddus: { sv: "muddusmuttos-nationalpark", en: "muddusmuttos-national-park" },
  pieljekaise: { sv: "pieljekaise-nationalpark", en: "pieljekaise-national-park" },
  "haparanda-skargard": {
    sv: "haparanda-skargards-nationalpark",
    en: "haparanda-skargard-national-park",
  },
  bjornlandet: { sv: "bjornlandets-nationalpark", en: "bjornlandet-national-park" },
  skuleskogen: { sv: "skuleskogens-nationalpark", en: "skuleskogen-national-park" },
  sonfjallet: { sv: "sonfjallets-nationalpark", en: "sonfjallet-national-park" },
  tofsingdalen: { sv: "tofsingdalens-nationalpark", en: "tofsingdalen-national-park" },
  fulufjallet: { sv: "fulufjallets-nationalpark", en: "fulufjallet-national-park" },
  hamra: { sv: "hamra-nationalpark", en: "hamra-national-park" },
  farnebofjarden: {
    sv: "farnebofjardens-nationalpark",
    en: "farnebofjarden-national-park",
  },
  garphyttan: { sv: "garphyttans-nationalpark", en: "garphyttan-national-park" },
  tyresta: { sv: "tyresta-nationalpark", en: "tyresta-national-park" },
  angso: { sv: "angso-nationalpark", en: "angso-national-park" },
  namdoskargarden: {
    sv: "namdoskargardens-nationalpark",
    en: "namdoskargarden-national-park",
  },
  "norra-kvill": { sv: "norra-kvills-nationalpark", en: "norra-kvill-national-park" },
  "store-mosse": { sv: "store-mosse-nationalpark", en: "store-mosse-national-park" },
  "bla-jungfrun": { sv: "bla-jungfrun-nationalpark", en: "bla-jungfrun-national-park" },
  "gotska-sandon": { sv: "gotska-sandon", en: "gotska-sandon-national-park" },
  asnen: { sv: "asnens-nationalpark", en: "asnen-national-park" },
  stenshuvud: { sv: "stenshuvuds-nationalpark", en: "stenshuvud-national-park" },
  "dalby-soderskog": {
    sv: "dalby-soderskog-nationalpark",
    en: "dalby-soderskog-national-park",
  },
  soderasen: { sv: "soderasens-nationalpark", en: "soderasen-national-park" },
  kosterhavet: { sv: "kosterhavets-nationalpark", en: "kosterhavet-national-park" },
  tiveden: { sv: "tivedens-nationalpark", en: "tiveden-national-park" },
  djuro: { sv: "djuro-nationalpark", en: "djuro-national-park" },
  tresticklan: { sv: "tresticklans-nationalpark", en: "tresticklan-national-park" },
};

const OFFICIAL_BASE = "https://www.sverigesnationalparker.se";

export function officialUrl(slug: string, locale: "sv" | "en"): string {
  const official = OFFICIAL_SLUGS[slug];
  if (!official) return `${OFFICIAL_BASE}/${locale === "sv" ? "sv" : "en"}`;
  return locale === "sv"
    ? `${OFFICIAL_BASE}/sv/upptack-nationalparkerna/${official.sv}`
    : `${OFFICIAL_BASE}/en/parks/${official.en}`;
}

export const PARKS: Park[] = [
  {
    slug: "abisko",
    name: "Abisko",
    year: 1909,
    area: 77,
    glyph: "mtn",
    color: 0,
    region: { en: "Lapland", sv: "Lappland" },
    description: {
      en: "Arctic birch forest, the grand Abisko canyon and the northern gateway to the Kungsleden trail.",
      sv: "Arktisk björkskog, den mäktiga Abiskokanjonen och Kungsledens norra port.",
    },
  },
  {
    slug: "vadvetjakka",
    name: "Vadvetjåkka",
    year: 1920,
    area: 26,
    glyph: "mtn",
    color: 1,
    region: { en: "Lapland", sv: "Lappland" },
    description: {
      en: "Sweden's northernmost park — bogs, limestone caves and a river delta very few ever visit.",
      sv: "Sveriges nordligaste nationalpark — myrar, kalkstensgrottor och ett floddelta som få någonsin besöker.",
    },
  },
  {
    slug: "stora-sjofallet",
    name: "Stora Sjöfallet",
    sami: "Stuor Muorkke",
    year: 1909,
    area: 1278,
    glyph: "mtn",
    color: 2,
    region: { en: "Lapland", sv: "Lappland" },
    description: {
      en: "Sharp peaks and vast mountain lakes around the once-mighty great falls.",
      sv: "Skarpa toppar och vidsträckta fjällsjöar kring det en gång mäktiga Stora Sjöfallet.",
    },
  },
  {
    slug: "padjelanta",
    name: "Padjelanta",
    sami: "Badjelánnda",
    year: 1962,
    area: 1984,
    glyph: "sun",
    color: 3,
    region: { en: "Lapland", sv: "Lappland" },
    description: {
      en: "Sweden's largest park — a high, open plateau that is Sámi summer grazing land.",
      sv: "Sveriges största nationalpark — en hög, öppen platå som är samisk sommarbetesmark.",
    },
  },
  {
    slug: "sarek",
    name: "Sarek",
    year: 1909,
    area: 1970,
    glyph: "mtn",
    color: 4,
    region: { en: "Lapland", sv: "Lappland" },
    description: {
      en: "Trail-less peaks, glaciers and the Rapa valley delta — Europe's great wilderness.",
      sv: "Väglösa toppar, glaciärer och Rapadalens delta — Europas stora vildmark.",
    },
  },
  {
    slug: "muddus",
    name: "Muddus",
    sami: "Muttos",
    year: 1942,
    area: 493,
    glyph: "pine",
    color: 5,
    region: { en: "Lapland", sv: "Lappland" },
    description: {
      en: "Ancient pine forest, deep gorges and great silent bogs.",
      sv: "Urgammal tallskog, djupa raviner och stora tysta myrar.",
    },
  },
  {
    slug: "pieljekaise",
    name: "Pieljekaise",
    sami: "Bielljekajsse",
    year: 1909,
    area: 153,
    glyph: "leaf",
    color: 0,
    region: { en: "Lapland", sv: "Lappland" },
    description: {
      en: "Quiet fells and endless mountain-birch forest just above the Arctic Circle.",
      sv: "Stilla fjäll och ändlös fjällbjörkskog strax norr om polcirkeln.",
    },
  },
  {
    slug: "haparanda-skargard",
    name: "Haparanda Skärgård",
    year: 1995,
    area: 60,
    glyph: "wave",
    color: 1,
    region: { en: "Bothnian Bay", sv: "Bottenviken" },
    description: {
      en: "Sandy outer-archipelago islands in the shallow, brackish Bothnian Bay.",
      sv: "Sandiga ytterskärgårdsöar i den grunda, bräckta Bottenviken.",
    },
  },
  {
    slug: "bjornlandet",
    name: "Björnlandet",
    year: 1991,
    area: 111,
    glyph: "pine",
    color: 2,
    region: { en: "Ångermanland", sv: "Ångermanland" },
    description: {
      en: "Fire-scarred old-growth forest, cliffs and boulder fields.",
      sv: "Brandpräglad urskog, branta stup och blockmarker.",
    },
  },
  {
    slug: "skuleskogen",
    name: "Skuleskogen",
    year: 1984,
    area: 30,
    glyph: "mtn",
    color: 3,
    region: { en: "High Coast", sv: "Höga kusten" },
    description: {
      en: "Coastal peaks, the Slåttdalsskrevan crevice and the ever-rising High Coast.",
      sv: "Kustberg, Slåttdalsskrevan och den ständigt stigande Höga kusten.",
    },
  },
  {
    slug: "sonfjallet",
    name: "Sonfjället",
    year: 1909,
    area: 104,
    glyph: "mtn",
    color: 4,
    region: { en: "Härjedalen", sv: "Härjedalen" },
    description: {
      en: "A bare, round fell that is one of Sweden's best places to spot bears.",
      sv: "Ett kalt, runt fjäll som är en av Sveriges bästa platser att se björn.",
    },
  },
  {
    slug: "tofsingdalen",
    name: "Töfsingdalen",
    year: 1930,
    area: 16,
    glyph: "pine",
    color: 5,
    region: { en: "Dalarna", sv: "Dalarna" },
    description: {
      en: "Roadless boulder valleys and gnarled old pines — for the truly determined.",
      sv: "Väglösa blockdalar och knotiga gammeltallar — för den verkligt enträgna.",
    },
  },
  {
    slug: "fulufjallet",
    name: "Fulufjället",
    year: 2002,
    area: 385,
    glyph: "mtn",
    color: 0,
    region: { en: "Dalarna", sv: "Dalarna" },
    description: {
      en: "Njupeskär, Sweden's tallest waterfall, and Old Tjikko, the 9,500-year-old spruce.",
      sv: "Njupeskär, Sveriges högsta vattenfall, och Old Tjikko, granen som är 9 500 år gammal.",
    },
  },
  {
    slug: "hamra",
    name: "Hamra",
    year: 1909,
    area: 14,
    glyph: "pine",
    color: 1,
    region: { en: "Dalarna", sv: "Dalarna" },
    description: {
      en: "Old-growth forest, wild rapids and mile-wide marshes packed into one small park.",
      sv: "Gammelskog, vilda forsar och vidsträckta myrar samlade i en enda liten park.",
    },
  },
  {
    slug: "farnebofjarden",
    name: "Färnebofjärden",
    year: 1998,
    area: 101,
    glyph: "wave",
    color: 2,
    region: { en: "Lower Dalälven", sv: "Nedre Dalälven" },
    description: {
      en: "A river wilderness of rapids and flooded forests, alive with eagles.",
      sv: "En älvvildmark av forsar och svämskogar, full av örnar.",
    },
  },
  {
    slug: "garphyttan",
    name: "Garphyttan",
    year: 1909,
    area: 1.1,
    glyph: "leaf",
    color: 3,
    region: { en: "Närke", sv: "Närke" },
    description: {
      en: "A preserved old farming landscape that erupts in spring flowers.",
      sv: "Ett bevarat äldre odlingslandskap som exploderar i vårblommor.",
    },
  },
  {
    slug: "tyresta",
    name: "Tyresta",
    year: 1993,
    area: 20,
    glyph: "pine",
    color: 4,
    region: { en: "Stockholm", sv: "Stockholm" },
    description: {
      en: "Primeval forest with 400-year-old pines, twenty minutes from the capital.",
      sv: "Urskog med 400-åriga tallar, tjugo minuter från huvudstaden.",
    },
  },
  {
    slug: "angso",
    name: "Ängsö",
    year: 1909,
    area: 1.7,
    glyph: "leaf",
    color: 5,
    region: { en: "Stockholm archipelago", sv: "Stockholms skärgård" },
    description: {
      en: "A tiny meadow island kept exactly as farmland looked a century ago.",
      sv: "En liten ängsö bevarad precis som odlingslandskapet såg ut för hundra år sedan.",
    },
  },
  {
    slug: "namdoskargarden",
    name: "Nämdöskärgården",
    year: 2025,
    area: 24,
    glyph: "wave",
    color: 0,
    region: { en: "Stockholm archipelago", sv: "Stockholms skärgård" },
    description: {
      en: "Sweden's newest park — a thousand islands, islets and skerries.",
      sv: "Sveriges nyaste nationalpark — tusen öar, holmar och skär.",
    },
  },
  {
    slug: "norra-kvill",
    name: "Norra Kvill",
    year: 1927,
    area: 1.1,
    glyph: "pine",
    color: 1,
    region: { en: "Småland", sv: "Småland" },
    description: {
      en: "Giant boulders and 350-year-old pines in a pocket of ancient forest.",
      sv: "Jätteblock och 350-åriga tallar i en ficka av urskog.",
    },
  },
  {
    slug: "store-mosse",
    name: "Store Mosse",
    year: 1982,
    area: 100,
    glyph: "sun",
    color: 2,
    region: { en: "Småland", sv: "Småland" },
    description: {
      en: "The largest bog south of Lapland, with cranes calling over golden mires.",
      sv: "Den största mossen söder om Lappland, där tranor ropar över gyllene myrar.",
    },
  },
  {
    slug: "bla-jungfrun",
    name: "Blå Jungfrun",
    year: 1926,
    area: 2,
    glyph: "sun",
    color: 3,
    region: { en: "Kalmar Strait", sv: "Kalmarsund" },
    description: {
      en: "A bare blue granite dome rising from the sea, wrapped in legend.",
      sv: "En kal, blå granitkupol som reser sig ur havet, omspunnen av sägner.",
    },
  },
  {
    slug: "gotska-sandon",
    name: "Gotska Sandön",
    year: 1909,
    area: 45,
    glyph: "wave",
    color: 4,
    region: { en: "Baltic Sea", sv: "Östersjön" },
    description: {
      en: "A remote island of sand dunes and pine forest, far out in the Baltic.",
      sv: "En avlägsen ö av sanddyner och tallskog, långt ute i Östersjön.",
    },
  },
  {
    slug: "asnen",
    name: "Åsnen",
    year: 2018,
    area: 19,
    glyph: "wave",
    color: 5,
    region: { en: "Småland", sv: "Småland" },
    description: {
      en: "A labyrinth of lake, islands and untouched shoreline forest.",
      sv: "En labyrint av sjö, öar och orörd strandskog.",
    },
  },
  {
    slug: "stenshuvud",
    name: "Stenshuvud",
    year: 1986,
    area: 4,
    glyph: "sun",
    color: 0,
    region: { en: "Skåne", sv: "Skåne" },
    description: {
      en: "Warm beaches, hornbeam woods and a hilltop view over all of Österlen.",
      sv: "Varma stränder, avenbokskog och utsikt över hela Österlen.",
    },
  },
  {
    slug: "dalby-soderskog",
    name: "Dalby Söderskog",
    year: 1918,
    area: 0.4,
    glyph: "leaf",
    color: 1,
    region: { en: "Skåne", sv: "Skåne" },
    description: {
      en: "A small deciduous wood carpeted in anemones every spring.",
      sv: "En liten lövskog täckt av vitsippor varje vår.",
    },
  },
  {
    slug: "soderasen",
    name: "Söderåsen",
    year: 2001,
    area: 16,
    glyph: "leaf",
    color: 2,
    region: { en: "Skåne", sv: "Skåne" },
    description: {
      en: "Beech-clad ravines and sweeping views from the Kopparhatten cliff.",
      sv: "Bokklädda raviner och vida utsikter från Kopparhatten.",
    },
  },
  {
    slug: "kosterhavet",
    name: "Kosterhavet",
    year: 2009,
    area: 389,
    glyph: "wave",
    color: 3,
    region: { en: "Bohuslän", sv: "Bohuslän" },
    description: {
      en: "Sweden's first marine park — cold-water corals and seal-dotted skerries.",
      sv: "Sveriges första marina nationalpark — kallvattenkoraller och skär fulla av sälar.",
    },
  },
  {
    slug: "tiveden",
    name: "Tiveden",
    year: 1983,
    area: 20,
    glyph: "pine",
    color: 4,
    region: { en: "Tiveden", sv: "Tiveden" },
    description: {
      en: "Troll forest of giant boulders between lakes Vättern and Vänern.",
      sv: "Trollskog med jätteblock mellan Vättern och Vänern.",
    },
  },
  {
    slug: "djuro",
    name: "Djurö",
    year: 1991,
    area: 24,
    glyph: "wave",
    color: 5,
    region: { en: "Lake Vänern", sv: "Vänern" },
    description: {
      en: "A lonely island group far out in Sweden's largest lake.",
      sv: "En ensam ögrupp långt ute i Sveriges största sjö.",
    },
  },
  {
    slug: "tresticklan",
    name: "Tresticklan",
    year: 1996,
    area: 30,
    glyph: "pine",
    color: 0,
    region: { en: "Dalsland", sv: "Dalsland" },
    description: {
      en: "One of the last roadless wilderness forests in southern Scandinavia.",
      sv: "En av södra Skandinaviens sista väglösa vildmarksskogar.",
    },
  },
];

export const PARK_COUNT = PARKS.length;

/**
 * Parks with final pin artwork at /public/pins/{slug}.png — sources live in
 * /pin-images/{slug}/final.png, so folder, file and slug all share one name.
 * The rest fall back to the generated glyph pin, so artwork can land one park
 * at a time.
 */
export const PIN_ARTWORK = new Set<string>([
  "abisko",
  "angso",
  "asnen",
  "bjornlandet",
  "bla-jungfrun",
  "dalby-soderskog",
  "djuro",
  "farnebofjarden",
  "fulufjallet",
  "garphyttan",
  "gotska-sandon",
  "hamra",
  "haparanda-skargard",
  "kosterhavet",
  "muddus",
  "namdoskargarden",
  "norra-kvill",
  "padjelanta",
  "pieljekaise",
  "sarek",
  "skuleskogen",
  "soderasen",
  "sonfjallet",
  "stenshuvud",
  "stora-sjofallet",
  "store-mosse",
  "tiveden",
  "tofsingdalen",
  "tresticklan",
  "tyresta",
  "vadvetjakka",
]);
