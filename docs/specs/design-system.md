# Design system

Web source: `parkpass-web/src/app/globals.css` (tokens ported from
`design/handoff/design-system/styles.css`), `PinBadge.tsx`.

"Organic": warm paper grounds, terracotta accent, sage secondary, brushed-gold
pin rims. Light theme only. The app doesn't switch to dark mode; the pins and
the fabric are designed for the paper ground.

## Colour tokens

| Token | Hex | Used for |
|---|---|---|
| `ground` | `#f5ead8` | screen background |
| `surface` | `#ebddc5` | cards, search field |
| `ink` | `#201e1d` | body text |
| `divider` | `rgba(32,30,29,.16)` | hairlines, borders |
| `accent` | `#c67139` | primary buttons, active chips, pinned map hexes |

**Accent ramp:** 100 `#fff2eb`, 200 `#ffe1d0`, 300 `#ffc6a5`, 400 `#f6a06b`,
500 `#d67f48`, 600 `#b2622d`, 700 `#8c491a`, 800 `#643312`, 900 `#402310`

**Sage ramp:** base `#7a8a5e`, 100 `#f0fae1`, 200 `#e1eecc`, 300 `#ccdbb2`,
400 `#aebf92`, 500 `#8fa073`, 600 `#728157`, 700 `#56633f`, 800 `#3d472b`,
900 `#272e1b`

**Gold ramp (pin rims):** 100 `#fdf3cd`, 200 `#f6e2a0`, 300 `#e8c86e`,
400 `#d9ad48`, 500 `#c2912c`, 600 `#a5761f`, 700 `#855d18`, 800 `#654613`,
900 `#46300d`

**Neutral ramp:** 100 `#f9f4ed`, 200 `#eee7db`, 300 `#dcd3c4`, 400 `#c0b6a5`,
500 `#a19786`, 600 `#82796a`, 700 `#645c50`, 800 `#474238`, 900 `#2e2b25`

Theme colour (status bar and browser chrome): `#c67139`. Launch background: `#f5ead8`.

## Typography

| Role | Font | Notes |
|---|---|---|
| Headings, buttons | **Caprasimo** 400 | chunky display serif; titles 27pt, detail name 29pt |
| Body | **Figtree** (variable, 300–900) | base 15pt, line height 1.55 |
| Codes | the platform monospace | transfer codes |

Both fonts are from Google Fonts under the SIL Open Font License. Bundle them
with the app rather than downloading at runtime, because the app works offline.

## Shape and elevation

| Token | Value |
|---|---|
| `radius-sm` | 8 |
| `radius-md` | 16 (cards, stamp box, legend) |
| `radius-lg` | 28 |
| cards on the You tab | 32 |
| pills and chips | fully rounded |
| `shadow-sm` | `0 1px 2px rgba(46,43,37,.14)` |
| `shadow-md` | `0 3px 10px rgba(46,43,37,.16)` |
| `shadow-lg` | `0 12px 32px rgba(46,43,37,.22)` |

Minimum tap target: 44pt. Primary and secondary buttons are 48pt, and the pin
button is 60pt.

## Pin badge

The one component every screen shares. It's drawn on a 64×64 canvas scaled to
the slot size (100 in the list, 210 on detail, column width on the board).

- **Rim**: a pointy-top regular hexagon centred at (32, 32) with circumradius 30.
  Vertex `i` (0…5) is at angle `60·i − 90`°. It's filled with a diagonal
  linear gradient (top-left to bottom-right) through the gold stops 0% `gold-100`,
  28% `gold-300`, 55% `gold-500`, 80% `gold-600`, 100% `gold-800`.
- **Enamel**: the same hexagon with circumradius 26.
  - **With artwork**: the square artwork is cover-fitted to the enamel
    hexagon's bounding box (width `2·26·cos 30° ≈ 45.03`, height 52, centred)
    and clipped to the enamel hexagon. Then the hexagon is stroked with
    `gold-700` at 0.7.
  - **Placeholder**: the enamel is filled with the palette's `light` and
    stroked with `gold-700` at 0.7. The glyph path is drawn with
    `translate(17.5, 17.5) scale(1.2)`, stroked in the palette's `dark`, width
    2.4–2.6, with round caps and joins.
- **States** apply to the whole badge:

  | Where | Unpinned | Pinned |
  |---|---|---|
  | list | greyscale 100%, opacity .38 | full |
  | detail | greyscale 85%, opacity .5 | full |
  | pin board | greyscale 100%, opacity .32, brightness 1.25 | full + drop shadow `0 3 3 rgba(0,0,0,.4)` |

## Motion

| Moment | Spec |
|---|---|
| Pin stamp-in | [park-detail.md](park-detail.md#pinning), 0.55s overshoot |
| Confetti | 16 particles, 0.65–0.92s, ease-out |
| Rubber stamp press | 0.45s after a 0.25s delay, accelerating |
| Progress bar | width change over 0.5s, ease-out |
| Sticky filter bar shadow | 0.2s fade-in when stuck |

Respect the platform's reduced-motion setting where practical: skip the
stamp-in and confetti, and show the final state.
