# ParkPass 🇸🇪

A checklist for Sweden's 31 national parks. Find a park, mark it visited, collect an enamel-pin badge for every one you've been to — and work your way toward the diploma Naturvårdsverket sends to anyone who visits all 31.

Web app first, with a mobile app planned. See [PLAN.md](PLAN.md) for the full product plan.

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

## Tech stack

| | |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS 4, with design tokens from the "Organic" design system |
| i18n | next-intl — Swedish (default) and English |
| Storage | `localStorage`, local-first (Supabase sync is in progress, see [Status](#status)) |
| Hosting | Vercel |

## Getting started

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
```

`check:links` exists because the official site's slugs are irregular — Swedish uses genitive forms (`tivedens-nationalpark`) that can't be derived from ours — so the URLs are stored in an explicit table and this script guards against link rot.

## Project structure

```
├── PLAN.md                    # product plan: scope, roadmap, decisions
├── design_handoff_parkpass/   # design reference: HTML prototype + design tokens
└── parkpass-web/              # the Next.js web app
    ├── messages/              # sv.json / en.json UI strings
    ├── scripts/               # link checker
    └── src/
        ├── app/[locale]/      # routes: parks, map, board, you, park/[slug]
        ├── components/        # ParkList, ParkDetail, SwedenMap, PinBoard, Profile, TabBar
        ├── data/              # the 31 parks, official URLs, hex-map geometry
        ├── i18n/              # next-intl routing and config
        └── lib/               # visited-state store
```

## Deployment

Deployed on Vercel from `main`. **The app is not at the repo root**, so the Vercel project's **Root Directory** must be set to `parkpass-web` — otherwise the build finds no framework and every route 404s.

## Status

Shipped: parks list, park detail, map, pin board, progress, Swedish/English.

In progress on the `feature/supabase-auth` branch: accounts via Google sign-in and passwordless magic links, so progress syncs across devices. It's parked pending Google OAuth setup — see the branch's pull request for the remaining steps.

Next up: visit notes, achievements, real per-park pin artwork, and the mobile app.

## Credits

Park data summarised from [sverigesnationalparker.se](https://www.sverigesnationalparker.se). Icons by [Lucide](https://lucide.dev). Fonts: Caprasimo and Figtree.
