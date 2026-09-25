# Park detail

Web source: `parkpass-web/src/components/ParkDetail.tsx`, `VisitStamp.tsx`,
`ConfettiBurst.tsx`, keyframes in `src/app/globals.css`.

## Layout, top to bottom (centred, 24pt side padding, scrollable)

1. **Back link** (see [navigation.md](navigation.md#park-detail)).
2. **Pin badge**, 210pt. When unpinned it shows greyscale 85% at 50% opacity;
   when pinned it shows full colour.
3. **Name**, heading font, 29pt, centred. Then the **Sámi name**, if any, in
   14pt italic `neutral-600`.
4. **Tags**: a row of pills (11pt, 3pt × 10pt padding):
   - the region, with `sage-100` background and `sage-800` text
   - `detail.est` ("Est. 1909"), with `neutral-100` background and
     `neutral-800` text
   - `detail.area` ("77 km²", locale-grouped), neutral like the year tag
5. **Description** in the current language, 15pt, line height 1.55,
   `neutral-800`, centred.
6. **Action slot**: a fixed 60pt height shared by both states, so toggling
   never moves the page.
   - **Unpinned**: a full-width pill button, `accent` fill, `ground` text,
     heading font 16pt, labelled `detail.pinIt` ("I've been here — pin it!").
   - **Pinned**: a card with `sage-200` background and 16pt corner radius,
     centred row: check icon (22pt, `sage-700`, stroke 2.75), then
     `detail.pinned` ("Pinned 24 Jul 2026") in 15pt bold `sage-800`, then an
     underlined **Undo** text button (`detail.undo`, 13pt semibold `sage-700`,
     44pt tap target).
7. **Official link**: a full-width ghost button, 48pt, heading font 14pt,
   `accent` text, labelled `detail.official`. It opens `officialUrl[lang]` in
   the external browser.
8. **Stamp slot**: a fixed 172pt height, right-aligned. It shows the rubber
   stamp when pinned and stays empty otherwise. The height is reserved either
   way.
9. **Disclaimer** at the bottom: `detail.disclaimer`, 11.5pt `neutral-500`,
   centred.

## Pinning

- Tapping **pin it** calls `mark(slug)` with today's local date (see
  [storage.md](storage.md)). The UI switches to the pinned state immediately
  and plays the **stamp moment**:
  - **Pin stamp-in**, 0.55s, easing `cubic-bezier(.2, 1.4, .4, 1)`:

    | t | scale | rotate | opacity |
    |---|---|---|---|
    | 0% | 2.4 | −16° | 0 |
    | 55% | 0.9 | 3° | 1 |
    | 75% | 1.06 | −1° | 1 |
    | 100% | 1 | 0° | 1 |

  - **Confetti**: 16 particles burst from the pin's centre (45% down the pin
    area). For particle `i` in 0…15:
    - angle = `i/16 · 2π + (i mod 3) · 0.21` rad
    - distance = `78 + (i mod 5) · 14` pt
    - end offset = `(cos(angle)·distance, sin(angle)·distance − 24)`
    - size = `6 + (i mod 4) · 2` pt; circle if `i` is odd, else a square with
      3pt corner radius
    - colour = `["#c67139", "#7a8a5e", "#f6a06b", "#aebf92", "#8c491a", "#e1eecc"][i mod 6]`
    - duration = `0.65 + (i mod 4) · 0.09` s, delay = `(i mod 5) · 0.03` s,
      ease-out
    - it animates from offset 0, scale 1, opacity 1 to the end offset, scale
      0.15, opacity 0
  - **Rubber stamp press**: 0.45s after a 0.25s delay, easing
    `cubic-bezier(.6, .04, .98, .335)` (it accelerates into the impact):

    | t | scale | rotate | opacity |
    |---|---|---|---|
    | 0% | 1.9 | −2° | 0 |
    | 55% | – | – | 0.9 |
    | 100% | 1 | −15° | 0.85 |

  - The animation state clears after 1.3s. Pinning again later replays it.
  - Native: fire a success **haptic** at the moment the pin lands.
- Tapping **Undo** calls `unmark(slug)` immediately, with no confirmation. It
  cancels any running stamp animation and hides the stamp.
- Opening a park that's already pinned shows the stamp statically: no
  animation, rotated −15°, opacity 0.85.

## Rubber stamp (VisitStamp)

A 164pt square drawing on a 120-unit canvas, in `sage-700` ink:

- an outer ring: circle r=56, stroke 2.6
- an inner ring: circle r=44, stroke 1
- "PARKPASS" set along the top arc (the path `M 12,60 A 48,48 0 0 1 108,60`,
  centred), 9.5u bold, letter spacing 2.6
- `detail.stampVisited` ("VISITED" / "BESÖKT") at y=55, 13u extra-bold,
  spacing 2.2
- the date at y=71, 10.5u bold, spacing 0.8: day as 2 digits, short month,
  year, **uppercased with periods removed** ("24 JUL 2026")
- "★★★" at y=86, 9u, spacing 3

The whole mark is rotated −15° at 85% opacity. The web version roughens the
ink with an SVG turbulence filter; native versions may do this or leave the
ink clean. The accessible label is `detail.stampAlt` ("Stamp: visited {date}").
