# Product

ParkPass is a checklist for Sweden's **31 national parks**. Find a park, mark
it visited, collect an enamel-pin badge for it, and work toward the diploma
Naturvårdsverket sends to anyone who visits all 31.

## Principles

These are product decisions, not implementation details. Every platform keeps them.

- **No account, no backend, no network.** All progress lives on the device.
  Moving it between devices uses [transfer codes](transfer-codes.md). The only
  outbound links are to the official park site, opened in the browser.
- **No location, ever.** Visits are on the honour system. The app never asks for
  location permission and never checks where the user is.
- **Unofficial.** ParkPass is not affiliated with Naturvårdsverket or Sveriges
  Nationalparker. The disclaimer appears on every park page and on the You
  tab. Every park links out to its official page.
- **No photos.** Park photos on the official site are copyrighted. Park pages
  are text plus our own pin artwork only.
- **Swedish first.** Swedish is the default language; English is complete.
- **Delight is the point.** The "pin it" moment (stamp-in animation, confetti,
  rubber stamp) is a core feature, not polish.

## Features

| Feature | Spec |
|---|---|
| Parks list with search and filters | [park-list.md](park-list.md) |
| Park detail, pin / undo, stamp animation, official link | [park-detail.md](park-detail.md) |
| Hex map of Sweden that lights up | [map.md](map.md) |
| Pin board collection | [pin-board.md](pin-board.md) |
| Progress, diploma, transfer codes, language | [profile.md](profile.md) |

## Out of scope (for now)

Accounts and sync, visit journals and notes, multiple visits per park,
achievements, photos, GPS or check-in, social features, monetisation. See
`docs/PLAN.md` for the roadmap.
