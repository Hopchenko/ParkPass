# Parkpass — Swedish National Parks Tracker

*Working title — alternatives: Krysslistan, 31 Parker, Parkmärken*

A web app (mobile app later) to track which of Sweden's **31 national parks** you have visited, with a collectible enamel-pin aesthetic, progress tracking, and light gamification.

---

## 1. Problem & Idea

Sweden has 31 national parks and an official goal-oriented culture around visiting them all — Naturvårdsverket even awards a **diploma signed by the Director General** when you've visited all 31. But the official "tracker" is a printable PDF checklist. There is no dedicated digital product for it.

**The app:** a beautiful, simple checklist of all 31 parks. Find a park, mark it visited, get a satisfying animation and a unique enamel-pin-style badge. Log in to keep progress across devices. Learn about each park and jump to the official site for trip planning.

## 2. Research: existing solutions

| Product | What it is | Gap we fill |
|---|---|---|
| [Official krysslista](https://www.sverigesnationalparker.se/inspiration-och-kunskap/krysslista) | Printable checklist + diploma for all 31 | Not digital, no accounts, no fun |
| [Naturkartan](https://www.naturkartan.se/en/nationalparker) | Sweden's biggest outdoor guide app (2M+ users); covers parks, trails, reserves | General-purpose; no gamified "collect all 31" experience |
| [Park'd](https://apps.apple.com/us/app/parkd-national-park-passport/id1622070861), [National Parks Journal](https://apps.apple.com/app/id6756534200), [HYOH](https://hyoh.app/) | US/global "national park passport" apps with stamps, stats, photos | US-focused or global-shallow; nothing tailored to Sweden. They validate the passport/stamp mechanic we're building on |

**Takeaway:** the niche is open, the mechanic is proven, and the official diploma gives a built-in end goal to market around ("Get your diploma — track your 31").

## 3. Data source

- Source of truth: [sverigesnationalparker.se](https://www.sverigesnationalparker.se/sv/upptack-nationalparkerna) — 31 parks, each with name (incl. Sámi names, e.g. Muddus/Muttos), description, and imagery.
- **No public API** → we curate a static dataset ourselves (JSON seed → DB). The list changes roughly once a decade (Nämdöskärgården was #31), so manual curation is fine.
- Per-park fields: slug, name (sv/en/Sámi), county/region, established year, area (km²), short description (sv/en), coordinates, official page URL, pin asset id.
- **Text only for now:** photos on the official site are copyrighted, so we don't use any photos at all — park pages are text + our own pin artwork. Photos can be revisited later only with properly licensed assets.
- ⚠️ **Branding:** don't imply affiliation with Naturvårdsverket/Sveriges Nationalparker; "unofficial tracker" positioning, link out generously.

## 4. MVP scope (v1.0, web)

1. **Park list** — all 31 parks, searchable/filterable (by region, visited/unvisited), sorted views.
2. **Park detail page** — pin artwork, general info (established, area, region, description) and a link to the official park page. Text only, no photos.
3. **Mark as visited** — one tap; optional visit date. Satisfying animation (pin "stamps" in, confetti-light). Undo supported.
4. **Progress** — "12 / 31 visited", progress bar, simple profile page showing your collected pins. Mention the official diploma at 31/31 with a link.
5. **Auth** — Google sign-in + email/password (Supabase Auth). Anonymous/local mode first, prompt to sign in to sync — don't gate the list behind login.
6. **i18n** — Swedish + English from day one.

**Explicitly out of MVP:** map view, achievements, Strava/Komoot, mobile app. **Not planned:** monetization, photo uploads, GPS features.

## 5. Roadmap after MVP

- **v1.1 — Map view.** Sweden map with park pins (visited = colored pin). Strong visual hook since parks cluster dramatically north. MapLibre + OSM tiles (free).
- **v1.2 — Visit journal.** Notes and visit dates per visit; multiple visits per park.
- **v1.3 — Achievements.** Badges: first park, 5/10/all northern parks, all island parks, "Lapland Grand Slam" (Sarek+Padjelanta+Stora Sjöfallet+Muddus), all 31 → diploma prompt.
- **v1.4 — Mobile app.** Expo/React Native app on the same Supabase backend, sharing TypeScript types and business logic; App Store + Google Play.
- **v2 — Integrations & social.** Strava/Komoot import (km hiked stats), shareable profile/pin-board image, friend compare.

## 6. Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Web | **Next.js** (App Router, TypeScript, Tailwind) | SEO for park pages (organic acquisition), fast to build |
| Backend | **Supabase** | Postgres, Auth (Google + email), RLS for per-user data |
| Mobile (later) | **Expo / React Native** | Shares backend, types, and logic with web |
| Hosting | Vercel (web) + Supabase cloud | Free tiers cover MVP comfortably |
| i18n | next-intl (or similar) | sv + en |
| Animations | Framer Motion + Lottie for the "visited" moment | Pin-stamp effect is a core delight feature |
| Assets | Enamel-pin SVG set, one per park | Provided by the owner; ship v1 with a consistent placeholder style until ready |

### Data model (initial)

- `parks` — static-ish reference table (fields in §3).
- `profiles` — user id, display name, locale.
- `visits` — user id + park id, visited_at (nullable date), created_at; later: notes.
- Local-first: unauthenticated visits stored in localStorage, merged into `visits` on first sign-in.

## 7. Risks & open questions

- **Pin artwork is the product's soul** — 31 assets, made by the owner. The app ships with a consistent placeholder pin style so development never blocks on art.
- **Naming/domain** — check availability, avoid the official brand.
- **Honor system** — visits are self-reported by design; no GPS or location permissions, ever. Keeps the app friction- and permission-free.

## 8. Milestones

1. **Week 1–2:** Dataset curation (31 parks, sv/en), Next.js scaffold, park list + detail pages (public, SEO-friendly).
2. **Week 3:** Visited toggle with animation, local-first progress, profile/pin-board page.
3. **Week 4:** Supabase auth + sync, i18n polish, deploy → **soft launch**.
4. **Then:** map view, visit journal, and onward per roadmap.
