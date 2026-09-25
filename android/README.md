# ParkPass for Android

A native Kotlin + Jetpack Compose port of the web app, built from
[`docs/specs/`](../docs/specs/README.md). It uses the same park data, the same
pin artwork and the same transfer codes: a code made on the phone imports on
the website, and the other way round.

- **Min Android**: 8.0 (API 26). **Target**: API 35.
- **App ID**: `com.hopchenko.parkpass`
- **Permissions**: none. No network, no location. Official park pages open in the browser.

## Install on your phone (no Android Studio needed)

Every push that touches the app builds a debug APK on GitHub Actions.

1. On GitHub, open **Actions → Android**, then the latest green run.
2. Under **Artifacts**, download **parkpass-debug-apk**. It's a zip; unzip it
   to get `app-debug.apk`. The phone's Files app can unzip it (Samsung: My
   Files → tap the zip → Extract).
3. Open `app-debug.apk` on the phone. The first time, Android asks to allow
   installs from this source (Samsung: *Settings → Security and privacy →
   Install unknown apps*, then allow My Files or your browser).
4. Install and open **ParkPass**.

Newer builds install over older ones and keep your pins, because every CI
build is signed with the same committed debug key (`app/debug.keystore`).
That key is for testing only. A Play Store release needs its own private key,
kept out of the repo.

## Build locally

You need Android Studio (or JDK 17 plus the Android SDK).

```bash
cd android
./gradlew :core:test          # transfer-code + data tests, plain JVM
./gradlew :app:assembleDebug  # → app/build/outputs/apk/debug/app-debug.apk
./gradlew :app:installDebug   # to a phone connected over USB
```

Or open the `android/` folder in Android Studio and press Run.

## Layout

```
android/
├── core/          plain Kotlin: Park model, map data, visit merging, transfer-code codec
│   └── src/test/  replays shared/passcode-vectors.json from the web codec
└── app/           the Compose app
    └── src/main/java/com/hopchenko/parkpass/
        ├── data/        ParkRepository (assets), VisitStore (SharedPreferences), formats
        └── ui/          ParkPassApp (tabs + nav), parks/, detail/, map/, board/, profile/,
                         components/PinBadge, theme/ (Organic tokens, Caprasimo + Figtree)
```

No data is duplicated. At build time Gradle copies `shared/parks.json`,
`shared/map.json`, the pin WebPs and the fabric texture from
`parkpass-web/public/` into the APK's assets.

## Keeping it in sync with the web app

- **Park data or codec changed on the web**: run `npm run export:shared` in
  `parkpass-web/` and commit `shared/`. CI fails if `shared/` is stale, and
  `:core:test` fails if the Kotlin codec disagrees with the web one.
- **UI strings changed**: update `app/src/main/res/values/strings.xml`
  (Swedish) and `values-en/strings.xml` (English). The keys mirror
  `parkpass-web/messages/*.json`.
- **New pin artwork**: nothing to do. The build picks up
  `parkpass-web/public/pins/*.webp`.
- **Launcher icon**: `npm run build:android-icon` in `parkpass-web/`.

## Native extras over the web app

A haptic when a pin lands, a share button and a one-tap paste for transfer
codes, a language that follows the phone (also settable in Android Settings →
Apps → ParkPass → Language), and Auto Backup of the pin board. See
[`docs/specs/native-platforms.md`](../docs/specs/native-platforms.md).

## Fonts

Caprasimo and Figtree are bundled from Google Fonts under the SIL Open Font
License. See `licenses/`.
