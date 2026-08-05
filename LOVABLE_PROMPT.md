# Rebuilding ParkPass in Lovable

Three prompts, in order. Prompt 1 builds the whole app; prompt 2 replaces Lovable's invented data with our real data; prompt 3 fixes what it usually gets wrong.

**Why not one prompt:** the 31-park dataset and the map's ~200 hex coordinates can't be invented — they have to be pasted from our files. Lovable also builds on React + Vite (not Next.js), so routing and i18n are described in its native idiom rather than ours.

---

## Prompt 1 — Build the app

> Build **ParkPass**, a mobile-first web app for tracking visits to Sweden's 31 national parks. Users browse the parks, mark ones they've visited, and collect enamel-pin badges for each. It's a personal checklist with a collector's feel.
>
> **Stack:** React + TypeScript + Tailwind + react-router. No backend and no authentication — progress persists in `localStorage` only. Never request geolocation.
>
> ### Layout shell
> Mobile-first. Center the app in a `max-width: 430px` column with `min-height: 100dvh`; the column is `#f5ead8` with a large soft shadow, sitting on a `#ebddc5` page background.
>
> Fixed bottom tab bar with 4 tabs: **Parks** (`/`), **Map** (`/map`), **Pin board** (`/board`), **You** (`/you`). Use `lucide-react` icons — `TreePine`, `Map`, `Award`, `User` — at 24px, `strokeWidth={2.4}`, with an 11px bold label underneath. Active tab `#8c491a`, inactive `#a19786`. Bar background `#f9f4ed` with a 1px top divider, min tap height 52px, and respect `env(safe-area-inset-bottom)`. Main content needs ~84px bottom padding so it clears the bar.
>
> ### Design tokens
> Define these as CSS variables and expose them in the Tailwind theme:
>
> ```
> ground   #f5ead8    surface  #ebddc5    ink  #201e1d
> divider  rgba(32, 30, 29, 0.16)
>
> accent (terracotta)  100 #fff2eb  200 #ffe1d0  300 #ffc6a5  400 #f6a06b
>                      500 #d67f48  600 #b2622d  700 #8c491a  800 #643312  900 #402310
>                      base #c67139
>
> sage                 100 #f0fae1  200 #e1eecc  300 #ccdbb2  400 #aebf92
>                      500 #8fa073  600 #728157  700 #56633f  800 #3d472b  900 #272e1b
>                      base #7a8a5e
>
> gold                 100 #fdf3cd  200 #f6e2a0  300 #e8c86e  400 #d9ad48
>                      500 #c2912c  600 #a5761f  700 #855d18  800 #654613  900 #46300d
>
> neutral              100 #f9f4ed  200 #eee7db  300 #dcd3c4  400 #c0b6a5
>                      500 #a19786  600 #82796a  700 #645c50  800 #474238  900 #2e2b25
>
> radii    sm 8px  md 16px  lg 28px  (pills 999px)
> shadows  sm 0 1px 2px rgba(46,43,37,.14)
>          md 0 3px 10px rgba(46,43,37,.16)
>          lg 0 12px 32px rgba(46,43,37,.22)
> ```
>
> **Fonts (Google Fonts):** `Caprasimo` weight 400 for all headings, `Figtree` 400/600/700 for body. Body text 15px / line-height 1.55. Focus rings: `2px solid #c67139`, offset 2px. Minimum tap target 44px.
>
> ### The pin badge (core visual)
> A reusable `PinBadge` component — an enamel pin as an inline SVG, `viewBox="0 0 64 64"`, rendered at three sizes: **46px** (list rows), **74px** (pin board), **156px** (detail page). Props: `glyph`, `color` (palette index), `size`.
>
> Structure, in order:
> 1. **Gold rim** — a *pointy-top* hexagon at radius 30 centered on (32,32), filled with a diagonal linear gradient (`x1=0 y1=0 x2=1 y2=1`) through gold `100 → 300 → 500 → 600 → 800` at offsets 0/28/55/80/100%. This diagonal highlight-to-shadow sweep is what makes it read as metal instead of flat yellow.
> 2. **Enamel field** — a pointy-top hexagon at radius 24, filled with the park's *light* color, stroked 1px in gold-700.
> 3. **Glyph** — a nature icon (mountain / pine / wave / leaf / sun) drawn on a 24×24 grid, `transform="translate(17.5,17.5) scale(1.2)"`, `fill="none"`, stroked in the park's *dark* color at 2.5, round caps and joins.
> 4. **Gloss** — an ellipse `cx=23 cy=16 rx=10 ry=4.5`, `fill="rgba(255,255,255,.4)"`, `transform="rotate(-28 23 16)"`.
>
> Compute hexagon points as `angle = 60·i − 90°`, `x = 32 + r·cos(angle)`, `y = 32 + r·sin(angle)`. Give each gradient a unique id (React's `useId`) — the pin board renders 31 pins on one page and duplicate ids would make them all share the first gradient.
>
> Unvisited pins are shown with a CSS filter instead of different artwork: `grayscale(1) opacity(.38)` in list rows, `grayscale(.85) opacity(.5)` on the detail page.
>
> ### Screen 1 — Parks (`/`)
> - Title row: **ParkPass** (27px Caprasimo) with a 🇸🇪 flag emoji beside it (decorative, `aria-hidden`), and a pill chip on the right reading "{n} / 31 pinned" (accent-100 background, accent-800 text, 11px).
> - Subtitle line under the title: "Swedish national parks" — 13.5px, neutral-600.
> - **Sticky filter block** below the title: a pill-shaped search input (min-height 44px, surface background, divider border) plus three filter chips — **All 31 / Pinned / Not yet**. Active chip is solid accent with white text; inactive is a neutral-400 outline with neutral-700 text; 13px bold, fully rounded. This block sticks to the top on scroll with a `ground` background and gains a soft shadow once stuck (use an IntersectionObserver sentinel, not a scroll listener). The title row scrolls away.
> - Park rows: min-height 66px, 1px divider between, hover background neutral-100. Each row: 46px pin, then name (15px bold) above a meta line (12.5px neutral-600) reading "{region} · Est. {year} · {area} km²", then a sage check icon if visited, then a neutral-400 chevron. The whole row links to the park detail.
> - Search filters on name, Sámi name, and region (case-insensitive substring); it combines with the chips. Empty state: *No parks match — try "Lapland" or "Skåne".*
>
> ### Screen 2 — Park detail (`/park/:slug`)
> - Back link top-left: "‹ Parks", accent-700, bold, 44px tap target.
> - Centered 156px pin.
> - Park name 29px Caprasimo centered; if the park has a Sámi name, show it below in italic neutral-600 14px.
> - A centered row of three tags: region (sage-100 bg / sage-800 text), "Est. {year}" and "{area} km²" (neutral-100 / neutral-800). All 11px, pill-shaped.
> - Description paragraph, 15px, centered, neutral-800.
> - **If not visited:** a full-width primary button, min-height 52px, accent background, ground-colored Caprasimo text: *"I've been here — pin it!"*
> - **If visited:** a sage-200 card with a check icon, "Pinned {date}" in sage-800 bold, and an underlined "Undo" button. Undo is immediate, no confirmation.
> - A full-width ghost link: *"Plan a trip on the official site ↗"* opening the park's official page in a new tab.
> - Footer microcopy, 11.5px neutral-500: *"Unofficial tracker — not affiliated with Naturvårdsverket."*
>
> **The pin moment** (this is the app's signature interaction): when a park is marked visited, the pin plays a `stampIn` animation — `0.55s cubic-bezier(.2, 1.4, .4, 1)`, keyframes: `0%` scale(2.4) rotate(-16deg) opacity 0 → `55%` scale(.9) rotate(3deg) opacity 1 → `75%` scale(1.06) rotate(-1deg) → `100%` scale(1) rotate(0). Simultaneously, 16 confetti particles radiate outward from the pin: sizes 6–12px, alternating circles and 3px-radius squares, colors `#c67139 #7a8a5e #f6a06b #aebf92 #8c491a #e1eecc`, travelling 78–148px outward over 0.65–0.95s with staggered delays up to 0.12s, shrinking to 0.15 scale and fading out. Clear the animation state after 1.3s.
>
> ### Screen 3 — Map (`/map`)
> A hex-grid map of Sweden. Header matches the other screens: "Map" title plus an "{n} / 31" chip. The map is one SVG of congruent hexagons: land hexes filled `neutral-300`, park hexes filled `sage-400` when unvisited and **accent** when visited. Each park hex is clickable and keyboard-focusable, links to that park's detail page, and has a tooltip with the park name and region. Below the map, a small legend: an accent dot labelled "Pinned" and a sage dot labelled "Not yet".
>
> *(I'll paste the exact hex geometry in the next message — use placeholder hexes for now.)*
>
> ### Screen 4 — Pin board (`/board`)
> A deliberately skeuomorphic display case. Header: "Pin board" + "{n} / 31" chip.
> - **Wooden frame:** 10px padding, 26px radius, background `linear-gradient(135deg, rgba(255,255,255,.14), rgba(0,0,0,.16))` over `repeating-linear-gradient(92deg, #8c5a2e 0px, #7a4c24 7px, #96632f 14px, #82522a 22px, #8f5d2d 30px)`, plus shadow-md and inset bevels `inset 0 1px 2px rgba(255,255,255,.3), inset 0 -2px 4px rgba(0,0,0,.3)`.
> - **Fabric surface inside:** a dark green textile texture (`#3a4a28` fallback), 16px radius, deep inset shadow `inset 0 3px 12px rgba(0,0,0,.5)`, padding `20px 12px 22px`.
> - **Grid:** 3 columns, gap 18px/10px, of 74px pins with the park name beneath (10.5px bold, `text-shadow: 0 1px 2px rgba(0,0,0,.4)`). Visited pins are full color with `drop-shadow(0 3px 3px rgba(0,0,0,.4))` and a `#f5ead8` label; unvisited are `grayscale(1) opacity(.32) brightness(1.25)` with a `rgba(245,234,216,.45)` label. Each pin links to its park.
>
> ### Screen 5 — You (`/you`)
> Stacked cards, 32px radius:
> - **Progress card** (surface): the count in 44px Caprasimo accent-700 next to "/ 31 parks pinned" (17px bold neutral-600); a 14px pill progress bar (neutral-300 track, accent fill, width animates over 0.5s); then a line reading "{n} parks to go — the diploma is waiting." — or at 31, "All 31! Time to claim that diploma. 🎉"
> - **Diploma card** (sage-200): "The diploma awaits 🏅" / "Visit all 31 and Naturvårdsverket will send you a diploma signed by the Director General. Really." / a link "About the official checklist ↗" → `https://www.sverigesnationalparker.se/inspiration-och-kunskap/krysslista`
> - **Sync card** (surface): "Keep your pins safe" / "Your progress lives on this device for now. Sign in to sync it everywhere." / a **disabled** button reading "Sign in — coming soon". Leave it disabled — accounts are a later phase.
> - A small language toggle: "Language: Svenska · English" with the active one bold accent-700.
> - Footer: "Unofficial tracker · Visits are on your honor 🤝"
>
> ### Language
> The app ships in **Swedish (default) and English**. Put every user-facing string in two dictionaries and switch via a React context, persisting the choice to `localStorage`. Swedish is what a first-time visitor sees. Format numbers per locale (Swedish writes `1 278 km²`) and dates as e.g. `25 jul 2026` / `25 Jul 2026`.
>
> ### State
> Visited parks are a single `Record<slug, isoDate>` object in `localStorage` under the key `parkpass-visited`. Marking writes today's date; undo deletes the key. Keep it in one store/context so the count chip, map, board and progress bar all stay in sync instantly.

---

## Prompt 2 — Paste the real data

> Replace the placeholder park data, map geometry, and translation strings with these exact files. Keep the same component structure — only the data changes.

Then paste, from this repo:

| Paste this file | What it gives Lovable |
|---|---|
| `parkpass-web/src/data/parks.ts` | All 31 parks (names, Sámi names, regions, years, areas, sv+en descriptions), the 5 glyph paths, the 6 color palettes, and the verified official-site URLs |
| `parkpass-web/src/data/mapHexes.ts` | The exact hex-grid geometry of Sweden and which hex belongs to which park |
| `parkpass-web/messages/sv.json` + `en.json` | Every UI string in both languages |

Add this note when you paste `parks.ts`:

> The official-site URLs must be used exactly as given — Swedish paths use genitive forms (`tivedens-nationalpark`) that can't be derived from the slug, and the three parks with Sámi names concatenate both names. Do not generate these URLs programmatically.

---

## Prompt 3 — Fix-ups

Things Lovable typically needs nudging on. Check the build against these, then send whichever apply:

> - The 🇸🇪 flag should sit next to the "ParkPass" title at roughly 21px — slightly smaller than the wordmark — and be `aria-hidden`.
> - The search and filter chips must stay stuck to the top while the list scrolls under them, with the title row scrolling away. The shadow should appear only once the block is actually stuck.
> - Pin hexagons must be **pointy-top** (a vertex at top and bottom, flat vertical sides) so they match the map's hexes.
> - Each pin's gold gradient needs its own unique id — on the pin board all 31 pins currently share one gradient.
> - The stamp animation must overshoot: it scales *past* its final size and settles back. A plain fade or scale-up is wrong.
> - Marking a park visited should update the count chip, the map hex, and the pin board immediately without a reload.
> - Swedish is the default language for a first-time visitor, not English.

---

## Notes on differences from our build

- **Routing/i18n:** our Next.js app puts English behind an `/en` URL prefix (better for SEO, since each park has its own indexable page). Lovable's React SPA is described above with context-based switching instead — simpler, but park pages won't be individually indexed by search engines.
- **The fabric texture** on the pin board is `parkpass-web/public/pinboard-fabric.avif` in our repo. Upload it to Lovable, or let it generate a CSS texture — check the asset's license before shipping it publicly either way.
- **Pin artwork** is a generated placeholder in both builds. Real per-park enamel-pin SVGs drop into the same 46/74/156px slots.
- **Accounts** are intentionally absent. Our Supabase work (Google + magic-link sign-in, visit sync) is parked on the `feature/supabase-auth` branch; Lovable has native Supabase integration if you want to add it there instead.
