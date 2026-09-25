# Storage

Web source: `parkpass-web/src/lib/visited.tsx`.

## The model

The whole of a user's progress is one map:

```
slug → visit date (ISO "YYYY-MM-DD")
```

A park is **pinned** if and only if its slug is a key. There is one date per
park. There is no visit history and no notes.

Reading must tolerate slugs that are no longer in the dataset. Keep them
stored, but don't count or show them. The progress count is the number of
**current** parks whose slug is present.

## Operations

| Operation | Behaviour |
|---|---|
| `mark(slug)` | Sets `slug → today` (overwrites if already present). |
| `unmark(slug)` | Removes the key. No confirmation. |
| `merge(incoming)` | Union with the incoming map. Returns `{ added, updated }`. |

### Merge rules (used by transfer-code import)

Merge is **never** a replacement. Importing must not be able to destroy pins
the device already has.

For each `(slug, date)` in the incoming map:
- If the slug isn't stored, add it (`added += 1`).
- If the slug is stored with a **later** date, replace it with the incoming
  date (`updated += 1`), because the earlier visit is the one that happened
  first. ISO dates compare correctly as plain strings.
- Otherwise leave it unchanged.

Only persist if `added + updated > 0`.

## "Today"

`today` is the **device's local calendar date**, not UTC. A pin made at 00:30
Swedish time must say today, not yesterday. (The web app had exactly this bug
once; see commit `aab78fa`.)

## Persistence

| Platform | Where |
|---|---|
| Web | `localStorage["parkpass-visited"]`, value is the JSON object above |
| Android | `SharedPreferences` file `parkpass`, key `parkpass-visited`, same JSON |
| iOS | `UserDefaults` key `parkpass-visited`, same JSON (recommended) |

Use the same JSON shape everywhere, so a future export or debug tool can read
any of them.

- A corrupt or unreadable value means starting from an empty map. Never crash.
- Changes must be visible on every screen immediately. On the web, other
  browser tabs are kept in sync through the `storage` event.
- Native apps must use **durable** storage, not WebView storage, which the OS
  can evict (see `docs/MOBILE.md`). On Android, the preferences file is also
  covered by Auto Backup, so a reinstall on a phone signed into Google restores
  the board.
