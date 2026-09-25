# Navigation

Web source: `parkpass-web/src/components/TabBar.tsx`, `BackLink.tsx`,
`src/app/[locale]/…`.

## Tabs

A bottom tab bar with four tabs, always visible (including on park detail):

| Order | Tab | Label (sv / en) | Icon (Lucide path, 24×24, stroke 2.4) |
|---|---|---|---|
| 1 | Parks (start) | Parker / Parks | `M17 14l3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h-.3a1 1 0 0 1-.7-1.7L9 9h-.2A1 1 0 0 1 8 7.3L12 3l4 4.3a1 1 0 0 1-.8 1.7H15l3 3.3a1 1 0 0 1-.7 1.7H17Z M12 22v-3` |
| 2 | Map | Karta / Map | `M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0l4.212 2.106Z M15 5.764v15 M9 3.236v15` |
| 3 | Pin board | Nålbrädan / Pin board | `M12 14a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z M15.5 12.9 17 22l-5-3-5 3 1.5-9.1` |
| 4 | You | Du / You | `M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z` |

Bar style: `neutral-100` background, a 1px `divider` top border, a 52pt
minimum tap height, label 11pt bold. The active tab is `accent-700` and
inactive tabs are `neutral-500`. It respects the bottom safe area.

## Park detail

Park detail is pushed on top of whichever tab opened it: Parks list, Map or
Pin board. The origin tab stays highlighted in the tab bar.

- **Back link** (top-left, "‹ {origin tab label}", `accent-700`, 15pt bold, 44pt
  tap target) returns to the origin tab. The web app passes the origin as
  `?from=map|board` and defaults to Parks.
- On native, system back (Android back gesture, iOS swipe) does the same thing.
- Tapping a tab while on detail goes to that tab's root.
- Scroll position on the list is kept when returning from detail.

## Web routes (reference)

| Route | Screen |
|---|---|
| `/{locale}` | Parks list (`/` → Swedish) |
| `/{locale}/map` | Map |
| `/{locale}/board` | Pin board |
| `/{locale}/you` | You |
| `/{locale}/park/{slug}?from=map\|board` | Park detail |

Native apps don't need URL routes. Deep links (`/park/{slug}`) are a possible
later addition.
