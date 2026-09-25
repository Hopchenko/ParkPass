# Map tab

Web source: `parkpass-web/src/components/SwedenMap.tsx`, geometry in
`shared/map.json` (see [data.md](data.md#map-geometry--sharedmapjson)).

## Layout

1. **Header**: title `map.title` (heading font, 27pt) on the left, count chip
   `map.count` ("12 / 31", same style as the list's count chip) on the right.
2. **The map** fills the width with 32pt side padding, keeping the viewBox
   aspect ratio (349.06 × 751.32). It's taller than the screen, so the page
   scrolls.
   - Land hexes are filled `neutral-300`.
   - Park hexes are drawn over them: `accent` when pinned, `sage-400` when not.
   - No strokes, and no clipping to the viewBox (some hexes overhang it).
3. **Legend**, overlaid in the top-left over the empty north-west of the map:
   a rounded box (`ground` at 80% opacity, 16pt radius, 12 × 8pt padding),
   12.5pt `neutral-700`, two rows each with a 12pt dot:
   - an `accent` dot with `map.legendVisited` ("Pinned")
   - a `sage-400` dot with `map.legendTodo` ("Not yet")

## Interaction

- Tapping a park hex opens that park's detail, with **Map** as the origin.
  Hit-testing must work for the whole hexagon. The hexes are small (about 6mm
  on a phone), so a touch within the hex's circumradius of its centre counts,
  and the nearest centre wins.
- Accessibility: each park hex is a link labelled with the park's name. The web
  version adds a tooltip "{name} · {region}". The map as a whole is labelled
  `map.mapLabel`.
- No zooming or panning is required.
