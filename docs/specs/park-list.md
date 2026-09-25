# Parks tab (list)

Web source: `parkpass-web/src/components/ParkList.tsx`.

## Layout, top to bottom

1. **Header** (scrolls away)
   - Title "ParkPass" (heading font, 27pt), followed by the 🇸🇪 flag (21pt).
   - On the right, a count chip: `parks.pinnedCount` ("12 / 31 pinned") as a
     pill with `accent-100` background, `accent-800` text, 11pt.
   - Subtitle `parks.subtitle` ("Swedish national parks"), 13.5pt `neutral-600`.
2. **Sticky filter bar**: stays pinned to the top while the list scrolls, on a
   `ground` background. Once stuck, it gets a soft shadow (`shadow-md`).
   - Search field: pill-shaped, 44pt minimum height, `surface` fill, `divider`
     border, which turns `accent` when focused. The placeholder is
     `parks.searchPlaceholder`.
   - Three chips below: `chipAll` / `chipPinned` / `chipTodo`. Pills with a
     1.5pt border, 13pt bold. Active: `accent` fill and border, white text.
     Inactive: transparent, `neutral-400` border, `neutral-700` text.
3. **Rows**, one per park in dataset order, separated by a 1px `divider`, with
   18pt horizontal and 12pt vertical padding:
   - A pin badge, 100pt. **Unpinned parks are shown greyscale at 38% opacity.**
   - The name, 18pt bold.
   - The Sámi name, if any: 13pt italic `neutral-500`.
   - The meta line `parks.meta`: "{region} · Est. {year} · {area} km²", 13pt
     `neutral-600`. The area can be fractional and uses locale number
     formatting (sv: `1 278`, `1,1`; en: `1,278`, `1.1`).
   - Pinned parks only: a check icon (`M20 6 9 17l-5-5`) followed by
     `detail.pinned` ("Pinned 24 Jul 2026"), 12.5pt semibold `sage-700`.
   - The whole row is tappable and opens [park detail](park-detail.md).
4. **Empty state** when nothing matches: `parks.noResults`, centred, 14pt
   `neutral-600`.

## Filtering

- **Search**: trim the query and lowercase it. A park matches if
  `"{name} {sami} {region in current language}"` in lowercase **contains** the
  query. An empty query matches everything.
- **Chips**: All (no filter), Pinned (slug is in visits), Not yet (slug isn't
  in visits).
- Search and chip combine with AND. Results stay in dataset order.
- Filter state is per-session. It survives navigating to detail and back, but
  it doesn't need to survive an app restart.
