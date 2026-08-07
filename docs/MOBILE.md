# Mobile apps: one repo, staged

Decision (2026-08-06): iOS and Android live in **this repo** when they happen.
No separate repos per platform.

## Why one repo

Separate repos earn their overhead when teams, release cadences, or CI
permissions diverge. None applies to a solo project. What a mobile app would
actually share with the web app is the expensive part:

- the 31-park dataset with sv/en descriptions (`parkpass-web/src/data/parks.ts`)
- the `OFFICIAL_SLUGS` table and its link checker (`check:links`)
- the UI translations (`parkpass-web/messages/`)
- the pin artwork (`pin-images/` sources, webp pipeline via `build:pins`)
- the transfer-code format (`parkpass-web/src/lib/passcode.ts`) — a phone and a
  browser must agree on it exactly, or codes stop moving between them

In one repo that's an import; across repos it becomes a versioned package or
copy-paste drift for no benefit.

## Where we are

**Stage 1 (PWA) is done.** `d7d73dc` added the web app manifest, icons,
robots and sitemap, so "Add to Home Screen" already gives an installable,
offline-capable, full-screen app on both platforms. For many users that is
the whole answer, and it costs nothing to maintain.

What the PWA still does not give you: a listing in the App Store or Play
Store, push notifications, or a home-screen widget. Stage 2 is only about
those.

## Choosing a stage-2 path

| | Reuses the UI | Effort | Gets you |
|---|---|---|---|
| **Capacitor** | 100% | days | Both stores, one codebase |
| **Expo / React Native** | data + strings only | weeks | Both stores, true native |
| **TWA (Android only)** | 100% | hours | Play Store only |

**Recommendation: Capacitor.** This doc's own rule was "native only when a
capability demands it" — nothing does yet. ParkPass is a checklist that renders
a grid of SVG and WebP; there is no scrolling-performance or gesture problem
that a WebView makes worse. Expo would mean rewriting Tailwind into NativeWind,
next-intl into expo-localization, the Next router into Expo Router, and the
`PinBadge` SVG into react-native-svg — weeks of work to arrive back at the same
screens. Revisit Expo when a widget or push notification is actually on the
roadmap.

Worth knowing: the transfer codes make this much easier than it would have been
with accounts. There is no session, no OAuth redirect, and no per-platform
sign-in SDK to integrate — a code generated on the phone pastes into the
browser and back.

## The static export (verified 2026-08-07)

Capacitor bundles a folder of static files, so the app must build with
`output: "export"`. It does, with two changes.

**1. The metadata routes need `force-static`.** Without it the export fails on
all three:

```
Error: export const dynamic = "force-static" not configured on route
"/sitemap.xml" with "output: export"
```

Add `export const dynamic = "force-static";` to the top of `src/app/manifest.ts`,
`src/app/robots.ts` and `src/app/sitemap.ts`. They are already statically
rendered on Vercel, so this is a no-op for the web build.

**2. There is no `index.html`.** Locale routing uses middleware (`src/proxy.ts`)
to rewrite `/` → `/sv`, and **middleware does not run in a static export**. The
export produces `sv.html` and `en.html` but nothing at the root, so a WebView
opening `index.html` gets a blank screen. Generate one as a post-build step:

```html
<!doctype html>
<meta charset="utf-8">
<title>ParkPass</title>
<script>
  var l = (navigator.language || "sv").toLowerCase().startsWith("en") ? "en" : "sv";
  location.replace(l + ".html");
</script>
```

This is also a small upgrade over the web behaviour: the bundled app can honour
the device language, where the site deliberately always serves Swedish at `/`.

With those two in place the export was confirmed working end to end, served as
plain files with no server: 76 pages generated, client-side navigation between
tabs and park pages, pin marking, `localStorage` persistence, WebP pin artwork,
and transfer-code generation all behaved exactly as they do under `next dev` —
the same board produced the same code, `PARKPASS-3000-0004-PMTP`.

## Setting up Capacitor

Prerequisites: Xcode and CocoaPods for iOS (macOS only), Android Studio and
JDK 17 for Android.

```bash
cd parkpass-web
npm install @capacitor/core @capacitor/cli
npx cap init ParkPass com.hopchenko.parkpass --web-dir=out
npm install @capacitor/ios @capacitor/android
npx cap add ios
npx cap add android
```

The `appId` is permanent once published to either store — pick it deliberately.

Then, on every change:

```bash
npm run build      # emits parkpass-web/out
npx cap sync       # copies out/ into the native projects
npx cap open ios   # or: npx cap open android
```

Commit `ios/` and `android/` but keep their build output ignored; Capacitor's
own `.gitignore` files handle that when the platforms are added.

## Two things that will bite

**Apple Guideline 4.2 (Minimum Functionality).** Apple rejects apps that are
"simply a repackaged website". A WebView wrapper around a checklist is squarely
in the blast radius, and this is the single most likely reason an iOS
submission fails. Ship at least a few things the browser cannot do, and say so
in the review notes: haptic feedback when a pin lands (`@capacitor/haptics`),
the native share sheet for the transfer code (`@capacitor/share`), and genuine
offline support. A home-screen widget would settle it entirely. Google Play is
far more relaxed and generally accepts the same build as-is.

**`localStorage` is not durable in a WebView.** iOS can evict WKWebView storage
under pressure, which on the web means a lost tab and on a phone means a user's
entire pin board vanishing from an app they installed. Before shipping, move
the store in `src/lib/visited.tsx` behind `@capacitor/preferences` (native
`UserDefaults` / `SharedPreferences`) when running inside Capacitor, keeping
`localStorage` for the web. The transfer code is a real backup here — but it
should not be the *only* thing standing between a user and losing 31 visits.

## Store logistics

- Apple Developer Program: **$99/year**, required to ship or even TestFlight.
- Google Play Console: **$25 once**.
- Both need a privacy policy URL. ParkPass collects nothing and has no backend,
  which makes this short — but it still has to exist and be reachable.
- Play requires a data-safety declaration; "no data collected" is accurate here.

## Cheaper Android-only path

If Android is the priority and the App Store is not, a Trusted Web Activity
wraps the existing PWA into a Play-ready package in about an hour, with no
Capacitor and no second build. See PWABuilder or Bubblewrap. It is Android-only
by nature, so it is a shortcut rather than a replacement for the above.

## What would change the one-repo decision

Separate repos become worth revisiting only if the mobile app grows its own
team/contributors, needs different repo permissions, or its release cadence
starts blocking web deploys (every push to `main` deploys the web app via
Vercel — path-filtered builds solve that inside the monorepo too).

If stage 2 ever becomes Expo instead of Capacitor, extract `parks.ts` and
`messages/` into `packages/data` with npm workspaces **at that point**, not
before — restructuring a working web app ahead of a mobile app that may not
happen is pure cost.
