# ParkPass for iPhone

A native SwiftUI port of the web app, built from
[`docs/specs/`](../docs/specs/README.md), a sibling of the
[Android app](../android/README.md). It uses the same park data, pin artwork
and UI strings, and the same transfer codes: a code made on the iPhone
imports on Android and the website, and the other way round.

- **iOS 17+**, iPhone, portrait. On iOS 26 the tab and navigation bars are
  Liquid Glass automatically (system components, nothing custom).
- **Bundle ID**: `com.hopchenko.parkpass`
- **No permissions, no network, no tracking**. See `ParkPass/PrivacyInfo.xcprivacy`.

## Run it on your iPhone (free Apple ID)

1. On your Mac, install **Xcode** from the App Store and open it once.
2. Clone the repo and open **`ios/ParkPass.xcodeproj`**.
3. Select the **ParkPass** project → **ParkPass** target → **Signing &
   Capabilities**. Tick *Automatically manage signing* and pick your **Team**.
   If you have no team yet: *Add an Account…* and sign in with your Apple ID
   to get a free "Personal Team".
   - If Xcode says the bundle ID is taken, change it to something unique, for
     example `com.yourname.parkpass`.
4. Plug in the iPhone with a cable, unlock it, tap **Trust**, and pick it as
   the run destination at the top of Xcode.
5. On the iPhone, turn on **Developer Mode** (Settings → Privacy & Security →
   Developer Mode) and restart when asked. You only do this once.
6. Press **Run** (⌘R). The first time, the iPhone blocks the app until you
   trust your certificate: Settings → General → **VPN & Device Management** →
   your Apple ID → **Trust**. Then open ParkPass.

With a free Apple ID the app stops launching after **7 days**. Plug in and
press Run again to renew it; your pins stay. A paid Apple Developer account
($99/yr) removes that limit and allows TestFlight.

Or run it without a phone: pick any iPhone Simulator as the destination and
press Run.

## Layout

```
ios/
├── ParkPass.xcodeproj    Xcode 16 project; folders are synced, so new files just appear
├── ParkPass/             the SwiftUI app
│   ├── ParkPassApp.swift     tabs (system TabView) + one NavigationStack per tab
│   ├── Data/                 ParkRepository (bundle assets), VisitStore (UserDefaults), L10n
│   ├── Screens/              list, detail (+ stamp, confetti), map, pin board, profile
│   ├── Components/, Theme/   PinBadge, pills, Organic colours + fonts
│   └── PrivacyInfo.xcprivacy
├── ParkPassCore/         Swift package: Park model, map data, merge, transfer codes,
│                         ICU strings; compiled into the app, tested with `swift test`
├── Config/Info.plist     launch screen colour, export compliance
└── scripts/copy-shared-assets.sh   build phase: bundles the shared data + artwork
```

No data is duplicated. At build time the *Copy shared assets* phase copies
`shared/*.json`, `parkpass-web/messages/*.json` (the UI strings, read as-is),
the pin WebPs and the fabric into the app bundle.

## Tests

```bash
swift test --package-path ios/ParkPassCore
```

These replay `shared/passcode-vectors.json` (written by the web codec), parse
the shared data, and format the web's real string catalogue. CI
(`.github/workflows/ios.yml`) runs them on a Mac runner and builds the app
for the Simulator on every push.

## Differences from Android

The strings come straight from the web's `messages/*.json`, so there's no
`strings.xml` equivalent to keep in sync. Tab icons and placeholder glyphs
are SF Symbols instead of Lucide, and back navigation is the system back
button and swipe. Everything else follows the same specs.
