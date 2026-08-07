# ParkPass 🇸🇪

A checklist for Sweden's 31 national parks. Find a park, mark it visited, collect an enamel-pin badge for every one you've been to — and work your way toward the diploma Naturvårdsverket sends to anyone who visits all 31.

Web app first, with a mobile app planned. See [docs/PLAN.md](docs/PLAN.md) for the full product plan and [docs/MOBILE.md](docs/MOBILE.md) for how mobile will land (same repo, PWA first).

> **Unofficial project** — not affiliated with Naturvårdsverket or Sveriges Nationalparker. Park information is summarised from public sources and every park links out to its official page.

## Features

- **Parks** — searchable list of all 31 parks, filterable by pinned / not yet visited
- **Park detail** — region, founding year, area, description, and a link to the official park page
- **Pin it** — mark a park visited with a stamp animation and confetti; undo any time
- **Map** — hex map of Sweden where each park lights up as you pin it
- **Pin board** — your collected pins on a cork-and-fabric board
- **You** — progress toward all 31, plus the diploma the official checklist offers
- **Swedish and English** — Swedish by default, English at `/en`
- **No account needed** — progress is stored locally in your browser; no location permissions, ever
- **Transfer codes** — move your whole board to another device by pasting one code, no sign-up and no server

## Tech stack

| | |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS 4, with design tokens from the "Organic" design system |
| i18n | next-intl — Swedish (default) and English |
| Storage | `localStorage` only — no backend; moving between devices uses [transfer codes](#transfer-codes) |
| Hosting | Vercel |

## Getting started

Requires Node.js 20.9 or newer.

```bash
cd parkpass-web
npm install
npm run dev
```

Then open http://localhost:3000 — the app is mobile-first, so a narrow viewport looks best.

### Scripts

Run these from `parkpass-web/`:

```bash
npm run dev          # start the dev server
npm run build        # production build
npm run lint         # eslint
npm run check:links  # verify all 62 official park links (31 parks × sv/en) still resolve
npm run build:pins   # rebuild public/pins/*.webp from the pin-images/ artwork
npm run build:icons  # rebuild PWA icons + og.png from the Abisko artwork
```

`build:pins` encodes near-lossless rather than lossy: the artwork's thin cream outlines sit on flat colour, and WebP's chroma subsampling greys them out at any lossy quality. Near-lossless still halves the pin board's page weight.

`check:links` exists because the official site's slugs are irregular — Swedish uses genitive forms (`tivedens-nationalpark`) that can't be derived from ours — so the URLs are stored in an explicit table and this script guards against link rot.

## Project structure

```
├── docs/
│   ├── PLAN.md                # product plan: scope, roadmap, decisions
│   ├── MOBILE.md              # decision: mobile apps live in this repo, staged plan
│   └── LOVABLE_PROMPT.md      # historical: the original rebuild prompt
├── design/
│   ├── handoff/               # design reference: HTML prototype + design tokens
│   ├── fabric/                # source + preview of the pin-board fabric
│   ├── sketches/              # pin artwork sketches
│   └── textures/              # unused texture candidates
├── pin-images/                # pin artwork sources, one folder per park slug
└── parkpass-web/              # the Next.js web app
    ├── messages/              # sv.json / en.json UI strings
    ├── scripts/               # link checker, pin webp builder
    └── src/
        ├── app/[locale]/      # routes: parks, map, board, you, park/[slug]
        ├── components/        # ParkList, ParkDetail, SwedenMap, PinBoard, Profile, TabBar
        ├── data/              # the 31 parks, official URLs, hex-map geometry
        ├── i18n/              # next-intl routing and config
        └── lib/               # visited-state store
```

## Deployment

Deployed on Vercel from `main`. **The app is not at the repo root**, so the Vercel project's **Root Directory** must be set to `parkpass-web` — otherwise the build finds no framework and every route 404s.

## Transfer codes

Moving a board to a new device needs no account. The **You** tab renders the whole board as one code:

```
PARKPASS-3ZZZ-ZZZ2-4G4D-M94G-JVH6-W2G2-54RA-JRNR-1CN2-VM5V-…
```

Paste it on the other device and the pins arrive with their visit dates intact. Importing **merges** — it is never destructive, and where both devices have the same park the earlier visit date wins.

The encoding lives in [`src/lib/passcode.ts`](parkpass-web/src/lib/passcode.ts): a 4-bit version, a 31-bit presence bitmap over a frozen park order, then a 14-bit day offset per pinned park, Crockford-base32'd with a CRC-16 checksum. Codes run ~20 characters for one pin to ~130 for all 31.

Two invariants keep old codes readable: `CODE_ORDER` is **append-only** (it is positional — reordering it redirects existing codes to the wrong parks), and a 32nd park means adding a *new* entry to `BITMAP_WIDTH` rather than widening version 1.

## Status

Shipped: parks list, park detail, map, pin board, progress, transfer codes, Swedish/English. The pin badges are generated placeholders for now — final per-park enamel-pin artwork drops into the same slots.

Accounts are no longer on the critical path — transfer codes cover cross-device moves with zero infrastructure. The `feature/supabase-auth` branch (Google sign-in and magic links) remains parked pending Google OAuth setup.

Next up: visit notes, achievements, real per-park pin artwork, and the mobile app.

## Credits

Park data summarised from [sverigesnationalparker.se](https://www.sverigesnationalparker.se). Icons by [Lucide](https://lucide.dev). Fonts: Caprasimo and Figtree.
