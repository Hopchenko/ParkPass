# ParkPass feature specs

Platform-neutral specifications for every ParkPass feature. They exist so the
native apps (Android today, iOS next) can be built to match the web app
without anyone having to reverse-engineer React components.

**The web app is the reference implementation.** Where a spec and
`parkpass-web/` disagree, the web app wins and the spec is the bug. Each spec
names the web source it was written from so the two can be re-checked.

## Index

| Spec | What it covers |
|---|---|
| [product.md](product.md) | What ParkPass is, principles, what is deliberately left out |
| [data.md](data.md) | The 31-park dataset, map geometry, pin artwork, `shared/` files |
| [storage.md](storage.md) | Visit records, dates, persistence, merge rules |
| [navigation.md](navigation.md) | Tabs, routes, back behaviour |
| [park-list.md](park-list.md) | Parks tab: search, filter chips, rows |
| [park-detail.md](park-detail.md) | Park page, pinning and undo, stamp + confetti, official link |
| [map.md](map.md) | Map tab: hex map of Sweden |
| [pin-board.md](pin-board.md) | Pin board tab: the cork-and-fabric collection |
| [profile.md](profile.md) | You tab: progress, diploma, transfer codes UI, language |
| [transfer-codes.md](transfer-codes.md) | **Bit-exact** transfer-code format — must match across platforms |
| [design-system.md](design-system.md) | Colours, type, pin badge geometry, animation timings |
| [i18n.md](i18n.md) | Languages, string keys, plurals, date and number formats |
| [native-platforms.md](native-platforms.md) | What native apps add on top of the web (haptics, share, backup) and where each spec lives in the Android and iOS code |

## Shared assets (don't copy — import)

The native apps read the same data the web app renders, generated from the
web sources by `npm run export:shared` (run from `parkpass-web/`):

| File | Generated from |
|---|---|
| `shared/parks.json` | `parkpass-web/src/data/parks.ts` |
| `shared/map.json` | `parkpass-web/src/data/mapHexes.ts` |
| `shared/passcode-vectors.json` | `parkpass-web/src/lib/passcode.ts` (codes produced by the web codec) |

Pin artwork is `parkpass-web/public/pins/{slug}.webp`, the pin-board fabric is
`parkpass-web/public/pinboard-fabric-seamless.webp`, and the UI strings are
`parkpass-web/messages/{sv,en}.json`. Native builds copy these at build time
rather than keeping their own copies.

## Porting checklist

A new platform is at parity when:

- [ ] All 31 parks render from `shared/parks.json`, with artwork for every park
- [ ] Search matches name, Sámi name and region; chips filter All / Pinned / Not yet
- [ ] Pinning stores today's **local** date; undo removes it; both persist across restarts
- [ ] Stamp-in + confetti on pin, rubber stamp mark with the visit date
- [ ] Map lights each park hex when pinned; tapping a hex opens the park
- [ ] Pin board shows all 31, pinned in colour, others greyed
- [ ] Progress, diploma card, language switch on the You tab
- [ ] Every vector in `shared/passcode-vectors.json` encodes and decodes identically
- [ ] A code made on the device imports on the web app, and vice versa
- [ ] Swedish and English, with the device language picking the default
- [ ] No account, no network calls, no location permission

## Changing a feature

1. Change the web app.
2. Update the matching spec in the same commit.
3. If data or the codec changed, run `npm run export:shared` and commit `shared/`.
4. Port the change to each native app.
