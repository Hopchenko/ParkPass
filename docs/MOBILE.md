# Mobile apps: one repo, staged

Decision (2026-08-06): iOS and Android live in **this repo** when they happen.
No separate repos per platform.

## Why

Separate repos earn their overhead when teams, release cadences, or CI
permissions diverge. None applies to a solo project. What a mobile app would
actually share with the web app is the expensive part:

- the 31-park dataset with sv/en descriptions (`parkpass-web/src/data/parks.ts`)
- the `OFFICIAL_SLUGS` table and its link checker (`check:links`)
- the UI translations (`parkpass-web/messages/`)
- the pin artwork (`pin-images/` sources, webp pipeline via `build:pins`)

In one repo that's an import; across repos it becomes a versioned package or
copy-paste drift for no benefit.

## Staged plan

1. **PWA first.** The app is mobile-first and local-first already — a web app
   manifest + icons gets "Add to Home Screen" install for roughly a day's
   work, no stores, no new project. Likely 90% of what "an app" means here.
   Do this before any native work.
2. **Native only when a capability demands it** (push notifications, offline
   maps, widgets). Per PLAN.md the intent is Expo — add `parkpass-mobile/`
   beside `parkpass-web/`. iOS and Android stay one Expo codebase, so
   "a repo per platform" never comes up.
3. **Extract shared code when step 2 starts, not before.** Lift `parks.ts`
   and `messages/` into `packages/data` with npm workspaces at that point.
   Restructuring the working web app ahead of a mobile app that may not
   happen is pure cost.

## What would change the decision

Separate repos become worth revisiting only if the mobile app grows its own
team/contributors, needs different repo permissions, or its release cadence
starts blocking web deploys (every push to `main` deploys the web app via
Vercel — path-filtered builds solve that inside the monorepo too).
