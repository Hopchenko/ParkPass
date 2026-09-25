# Data

Web source: `parkpass-web/src/data/parks.ts`, `parkpass-web/src/data/mapHexes.ts`.
Native apps read the generated `shared/parks.json` and `shared/map.json`.

## Parks — `shared/parks.json`

```jsonc
{
  "parks": [
    {
      "slug": "stora-sjofallet",          // stable id, [a-z-]; also the artwork file name
      "name": "Stora Sjöfallet",          // display name, same in both languages
      "sami": "Stuor Muorkke",            // optional Sámi name, shown in italics
      "year": 1909,                       // year established
      "area": 1278,                       // km²; may be fractional (Garphyttan is 1.1)
      "glyph": "mtn",                     // placeholder glyph: mtn | pine | wave | leaf | sun
      "color": 2,                         // index into the placeholder palette (mod 6)
      "region": { "sv": "Lappland", "en": "Lapland" },
      "description": { "sv": "…", "en": "…" },
      "officialUrl": { "sv": "https://…", "en": "https://…" },
      "hasArtwork": true                  // false → draw the placeholder glyph pin
    }
  ]
}
```

- **Order matters.** The array is in display order (roughly north to south), and
  the list and pin board both use it as-is.
- There are exactly 31 parks today. The count shown in the UI ("/ 31") is the
  array length, but the strings hard-code "31", as the web app does.
- `officialUrl` is precomputed. Don't try to derive it from the slug: the
  official site's slugs are irregular (Swedish genitives, concatenated Sámi
  names). The web app's `npm run check:links` guards these URLs.

### Placeholder palette

Used only when `hasArtwork` is false. Today every park has artwork, but the
fallback must still work, because artwork can be added one park at a time.

| index | main | light | dark |
|---|---|---|---|
| 0 | `#c67139` | `#ffe1d0` | `#8c491a` |
| 1 | `#7a8a5e` | `#e1eecc` | `#3d472b` |
| 2 | `#d67f48` | `#fff2eb` | `#8c491a` |
| 3 | `#8fa073` | `#f0fae1` | `#3d472b` |
| 4 | `#b2622d` | `#ffc6a5` | `#643312` |
| 5 | `#56633f` | `#ccdbb2` | `#272e1b` |

### Glyph paths (24×24 grid, stroke only, round caps and joins)

```
mtn   m8 3 4 8 5-5 5 15H2L8 3z
pine  M17 14l3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h-.3a1 1 0 0 1-.7-1.7L9 9h-.2A1 1 0 0 1 8 7.3L12 3l4 4.3a1 1 0 0 1-.8 1.7H15l3 3.3a1 1 0 0 1-.7 1.7H17Z M12 22v-3
wave  M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1
leaf  M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12
sun   M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M12 2v2 M12 20v2 M4.93 4.93l1.41 1.41 M17.66 17.66l1.41 1.41 M2 12h2 M20 12h2 M6.34 17.66l-1.41 1.41 M19.07 4.93l-1.41 1.41
```

## Pin artwork

- `parkpass-web/public/pins/{slug}.webp`: 360×360, square, near-lossless WebP.
  The sources are the 1024px PNGs at `pin-images/{slug}/final.png`.
- Artwork is square and is drawn **cover-fitted and clipped** into the enamel
  hexagon of the pin badge (see [design-system.md](design-system.md#pin-badge)).
- Don't encode the artwork lossily. The thin cream outlines sit on flat colour,
  and chroma subsampling greys them out.

## Map geometry — `shared/map.json`

A hex-grid map of Sweden taken from the official site's overview map.

```jsonc
{
  "viewBox": { "width": 349.06, "height": 751.32 },
  "land":  [[169.81, 711.89], …],               // anchor vertex of each land hex
  "parks": [{ "slug": "stenshuvud", "x": 84.91, "y": 732.65 }, …]
}
```

Every hexagon is congruent. Each one is stored as its **anchor vertex** (the
top-left corner), and the six corners are, in order:

```
(x,         y)
(x,         y + 12.45)
(x + 10.78, y + 18.68)
(x + 21.56, y + 12.45)
(x + 21.56, y)
(x + 10.78, y − 6.22)
```

So a hex spans `x … x+21.56` horizontally and `y−6.22 … y+18.68` vertically,
and its centre is `(x + 10.78, y + 6.23)`. Park hexes are drawn on top of land
hexes, and some park hexes sit off the land (islands such as Gotska Sandön and
Kosterhavet). Some park hexes have a negative-y top corner or sit at `x = 0`,
so drawing must not clip to the viewBox.
