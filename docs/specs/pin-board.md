# Pin board tab

Web source: `parkpass-web/src/components/PinBoard.tsx`.

A skeuomorphic board holding all 31 pins in dataset order. The pinned ones are
bright and the rest are ghosted, so it reads as a collection with gaps.

## Layout

1. **Header**: title `board.title` and count chip `board.count`, styled like the map.
2. **Wooden frame**: 14pt outer side margin, 10pt padding, 26pt corner radius.
   - Wood grain: a repeating horizontal-ish stripe at 92°, with the stops
     `#8c5a2e 0 → #7a4c24 7 → #96632f 14 → #82522a 22 → #8f5d2d 30` (in pt,
     repeating every 30pt), overlaid with a 135° gradient from
     `rgba(255,255,255,.14)` to `rgba(0,0,0,.16)`.
   - The frame has `shadow-md`, an inner top highlight and an inner bottom
     shadow (a bevel).
3. **Fabric surface** inside the frame: 16pt radius, padding 20pt top, 8pt
   sides, 22pt bottom.
   - `pinboard-fabric-seamless.webp` tiled at **280pt** per tile over a
     `#3a4a28` fallback.
   - Inset shadow: `inset 0 3px 12px rgba(0,0,0,.5)`.
4. **Grid**: 3 columns, 6pt column gap, 18pt row gap. Each cell is a tappable
   column containing:
   - the pin badge, filling the column width (it scales with the screen)
     - pinned: full colour with a drop shadow `0 3px 3px rgba(0,0,0,.4)`
     - not pinned: greyscale at 32% opacity, brightness 1.25
   - the park name, centred, 10.5pt bold, line height 1.25, text shadow
     `0 1px 2px rgba(0,0,0,.4)`. Pinned names are `#f5ead8`; the others are
     `rgba(245,234,216,.45)`.
   - tapping opens park detail with **Pin board** as the origin.
