# Handoff: Parkpass — Swedish National Parks Tracker (mobile)

## Overview
Mobile-first prototype of Parkpass: a gamified checklist of Sweden's 31 national parks. Users browse/search parks, open a detail page, mark a park visited (enamel-pin "stamp" moment with confetti), and see their collection on a skeuomorphic fabric pin board plus a progress/profile page. See `PLAN.md` for full product context (tech stack: Next.js + Supabase + Tailwind; mobile app later via Expo).

## About the Design Files
The files in this bundle are **design references created in HTML** — a working prototype showing intended look and behavior, NOT production code to copy directly. The task is to **recreate these designs in the target codebase** (Next.js App Router + TypeScript + Tailwind per PLAN.md) using its established patterns. `Parkpass.dc.html` is the prototype source: it contains all markup (inline-styled), all copy, the full 31-park seed dataset, and the interaction logic in a plain JS class — read it as the single source of truth for layout and behavior.

## Fidelity
**High-fidelity.** Colors, typography, spacing, copy, and interactions are final intent. Recreate pixel-perfectly using the design tokens below (Tailwind theme config recommended).

## Screens / Views

### 1. Parks (default tab)
- Purpose: searchable reference list of all 31 parks; entry point to detail.
- Header: app title "Parkpass" (Caprasimo 27px) left, count chip "N / 31 pinned" right (pill, accent tint).
- Search input: pill (border-radius 999px), placeholder "Search parks or regions…". Filters on name + Sámi name + region, case-insensitive substring.
- Filter chips: All 31 / Pinned / Not yet — pills, active = solid `#c67139` with white text, inactive = outlined `neutral-400`, text `neutral-700`. 13px/700.
- Rows (min-height 66px, divider borders): 46px pin badge (grayscale+38% opacity when unvisited) · name 15px/700 + meta line 12.5px `neutral-600` ("Region · Est. YYYY · N km²") · green check (visited only) · chevron. Whole row tappable → detail.
- Empty state: 'No parks match — try "Lapland" or "Skåne".'

### 2. Park detail (pushed over any tab)
- Back button "‹ Parks" top-left (accent-700, 44px hit target).
- Centered 156px enamel pin (see Pin badge spec). Unvisited: `grayscale(.85) opacity(.5)`.
- Park name (Caprasimo 29px centered), Sámi name below in italic `neutral-600` when present.
- Tag row: region (sage tag), "Est. YYYY", "N km²" (neutral tags).
- Description paragraph 15px/1.55 `neutral-800`, centered.
- If unvisited: primary block button "I've been here — pin it!" (min-height 52px).
- If visited: sage tinted card (`accent-2-200` bg, radius 16px): check icon + "Pinned {d MMM yyyy}" (`accent-2-800`) + underlined "Undo" button.
- Ghost block link "Plan a trip on the official site ↗" → `https://www.sverigesnationalparker.se/park/{slug}-nationalpark/` (new tab).
- Footer microcopy: "Unofficial tracker — not affiliated with Naturvårdsverket." 11.5px `neutral-500`.

### 3. Pin board tab (skeuomorphic)
- Header: "Pin board" + "N / 31" chip.
- Wooden frame: 10px padding, radius 26px, CSS wood grain — `linear-gradient(135deg, rgba(255,255,255,.14), rgba(0,0,0,.16))` over `repeating-linear-gradient(92deg, #8c5a2e 0, #7a4c24 7px, #96632f 14px, #82522a 22px, #8f5d2d 30px)`, plus `shadow-md` and inset bevel highlights (`inset 0 1px 2px rgba(255,255,255,.3), inset 0 -2px 4px rgba(0,0,0,.3)`).
- Fabric surface inside: `assets/pinboard-fabric.avif` tiled at 280px (fallback `#3a4a28`), radius 16px, deep inset shadow `inset 0 3px 12px rgba(0,0,0,.5)`, padding 20px 12px 22px.
- 3-column grid (gap 18px 10px) of 74px pins + names (10.5px/700, text-shadow `0 1px 2px rgba(0,0,0,.4)`). Visited: full color + `drop-shadow(0 3px 3px rgba(0,0,0,.4))`, name `#f5ead8`. Unvisited: `grayscale(1) opacity(.32) brightness(1.25)`, name `rgba(245,234,216,.45)`. Each pin taps into detail.

### 4. You tab (profile)
- Title "Your expedition" (Caprasimo 27px).
- Progress card: big count (Caprasimo 44px accent-700) "/ 31 parks pinned", 14px pill progress bar (track `neutral-300`, fill `#c67139`, animated width .5s), line "N parks to go — the diploma is waiting." (at 31: "All 31! Time to claim that diploma. 🎉").
- Diploma card (sage `accent-2-200`): "The diploma awaits 🏅" + copy about Naturvårdsverket's signed diploma + link to official checklist page.
- Sync card: "Keep your pins safe" + secondary block button "Sign in — coming soon" (auth per PLAN.md: Supabase, Google + email).
- Footer: "Unofficial tracker · Visits are on your honor 🤝".

### Shared: bottom tab bar
- 3 tabs: Parks (pine icon) / Pin board (medal icon) / You (user icon) — Lucide icons, stroke ~2.4–2.75, 24px, label 11px/700. Active: `accent-700`; inactive `neutral-500`. Bar: `neutral-100` bg, top divider, min tap height 52px.

### Pin badge (placeholder art component)
SVG, viewBox 0 0 64 64, per-park color set (6 rotating palettes from the accent/sage ramps, see `COLORS` in the prototype source):
outer circle r30 fill main · inner circle r25 fill light + 1.5px dark stroke · centered Lucide-style nature glyph (mountain/pine/waves/leaf/sun per park, stroke dark, round caps) · gloss: white 38%-alpha ellipse top-left rotated -28°.
These are placeholders — final per-park enamel-pin artwork replaces them 1:1 (same slot sizes: 46/74/156px).

## Interactions & Behavior
- Tab switch clears any open detail. Opening detail keeps the underlying tab.
- Mark visited: writes `{slug: ISO date}`; pin plays `stampIn` 0.55s `cubic-bezier(.2,1.4,.4,1)` (scale 2.4 rotate -16° → overshoot → settle) + 16 confetti particles radiating ~78–148px outward over ~0.65–0.95s (staggered ≤0.12s), fading/shrinking. Cleared after 1.3s.
- Undo removes the visit immediately, no confirmation.
- Search + chip filters combine (AND).
- Honor system: no GPS, no location permissions (per PLAN.md).

## State Management
- `visited: Record<slug, isoDate>` — persisted (prototype: localStorage key `parkpass-visited`; production: local-first, merged into Supabase `visits` on sign-in per PLAN.md).
- UI state: active tab, selected park slug (detail), search query, filter chip, transient `stamped` slug for the animation.
- Parks dataset is static (31 entries in prototype source: slug, name, Sámi name, region, year, area km², description, glyph, color index).

## Design Tokens
Full token sheet in `design-system/styles.css` (Organic design system). Key values:
- Ground `#f5ead8`, surface `#ebddc5`, text `#201e1d`.
- Accent (terracotta) `#c67139`, ramp 100–900 (`#fff2eb`→`#402310`); accent-700 `#8c491a` for accent text.
- Accent-2 (sage) `#7a8a5e`, ramp `#f0fae1`→`#272e1b`.
- Neutral ramp `#f9f4ed`→`#2e2b25`.
- Fonts: Caprasimo (headings, weight 400) / Figtree (body). Radii: 8 / 16 / 28px; pills 999px. Shadows: sm/md/lg in the stylesheet.
- Focus: `outline: 2px solid #c67139; offset 2px`. Min hit targets 44px.

## Assets
- `assets/pinboard-fabric.avif` — green textile texture for the pin board (user-provided).
- Icons: Lucide (lucide.dev), stroke-width 2.75.
- Pin artwork: placeholders only; 31 final enamel-pin SVGs to come from the owner.

## Files
- `Parkpass.dc.html` — the prototype (markup, logic class with dataset + handlers, all copy).
- `design-system/styles.css` — Organic design-system tokens + component classes.
- `assets/pinboard-fabric.avif` — fabric texture.
- `PLAN.md` — product plan (scope, data model, roadmap).
