# Native platforms

How the native apps relate to the web app, what they add, and where each spec
lives in the Android code. See `docs/MOBILE.md` for the decision history.

## What native adds

These are small, deliberate differences from the web app. Each one is
something a browser can't do well.

| Addition | Why | Android | iOS (suggested) |
|---|---|---|---|
| Haptic when a pin lands | the stamp moment should be felt | `HapticFeedbackConstants.CONFIRM` (API 30+), else `LONG_PRESS` | `UINotificationFeedbackGenerator(.success)` |
| Share the transfer code | the system share sheet beats copy-paste | `Intent.ACTION_SEND` chooser | `ShareLink` |
| Paste a code in one tap | avoids a long-press-and-paste dance | clipboard read on button tap | `PasteButton` |
| Durable storage | WebView storage can be evicted | `SharedPreferences` + Auto Backup | `UserDefaults` (+ iCloud KVS later) |
| Device-language default | no URL to pick a locale | per-app locales (`locales_config.xml`) | per-app language in Settings |
| App version on the You tab | support and debugging | `BuildConfig.VERSION_NAME` | `CFBundleShortVersionString` |

Everything else is at parity: same data, same codes, same strings, same look.

## What native must never add

The [product principles](product.md#principles) still hold: no network
permission use beyond opening links in the browser, no location, no
analytics, no accounts.

## Android implementation map

The project is `android/`: Kotlin, Jetpack Compose, Material 3 (used as a base,
then themed to the Organic tokens).

| Spec | Code |
|---|---|
| [data.md](data.md) | `core/…/Park.kt`, `core/…/ParkData.kt`, `core/…/MapData.kt` (parse `shared/*.json` from assets) |
| [storage.md](storage.md) | `core/…/Visits.kt` (merge logic), `app/…/data/VisitStore.kt` (persistence) |
| [transfer-codes.md](transfer-codes.md) | `core/…/Passcode.kt`, tested by `core/src/test/…/PasscodeTest.kt` against `shared/passcode-vectors.json` |
| [navigation.md](navigation.md) | `app/…/ui/ParkPassApp.kt` |
| [park-list.md](park-list.md) | `app/…/ui/parks/ParkListScreen.kt` |
| [park-detail.md](park-detail.md) | `app/…/ui/detail/ParkDetailScreen.kt`, `VisitStamp.kt`, `Confetti.kt` |
| [map.md](map.md) | `app/…/ui/map/MapScreen.kt` |
| [pin-board.md](pin-board.md) | `app/…/ui/board/PinBoardScreen.kt` |
| [profile.md](profile.md) | `app/…/ui/profile/ProfileScreen.kt` |
| [design-system.md](design-system.md) | `app/…/ui/theme/*`, `app/…/ui/components/PinBadge.kt` |
| [i18n.md](i18n.md) | `app/src/main/res/values/strings.xml` (sv, default), `values-en/strings.xml` |

`core` is a plain Kotlin/JVM module with no Android dependencies, so the codec
and data parsing can be unit-tested anywhere with `./gradlew :core:test`.

Assets aren't duplicated. The Gradle build copies `shared/*.json`, the pin
WebPs and the fabric texture from `parkpass-web/public/` into the APK at build
time.

## iOS implementation map

The project is `ios/`: SwiftUI, iOS 17+, built with system components
(TabView, NavigationStack), so iOS 26 renders its bars as Liquid Glass with no
custom code.

| Spec | Code |
|---|---|
| [data.md](data.md) | `ParkPassCore/…/Park.swift`, `MapData.swift`; `ParkPass/Data/ParkRepository.swift` |
| [storage.md](storage.md) | `ParkPassCore/…/Visits.swift`, `ParkPass/Data/VisitStore.swift` (UserDefaults) |
| [transfer-codes.md](transfer-codes.md) | `ParkPassCore/…/Passcode.swift`, tested against `shared/passcode-vectors.json` |
| [navigation.md](navigation.md) | `ParkPass/ParkPassApp.swift` |
| [park-list.md](park-list.md) | `ParkPass/Screens/ParkListView.swift` |
| [park-detail.md](park-detail.md) | `ParkPass/Screens/ParkDetailView.swift`, `VisitStamp.swift`, `Confetti.swift` |
| [map.md](map.md) | `ParkPass/Screens/SwedenMapView.swift` |
| [pin-board.md](pin-board.md) | `ParkPass/Screens/PinBoardView.swift` |
| [profile.md](profile.md) | `ParkPass/Screens/ProfileView.swift` |
| [design-system.md](design-system.md) | `ParkPass/Theme/Theme.swift`, `ParkPass/Components/PinBadge.swift` |
| [i18n.md](i18n.md) | `ParkPass/Data/L10n.swift` reads `parkpass-web/messages/*.json` directly; `ParkPassCore/…/Messages.swift` formats ICU |

iOS deviations, all deliberate: SF Symbols replace the Lucide tab icons and
placeholder glyphs, the system back button replaces the web's BackLink, and
the web's string catalogue is read as-is instead of being copied.

For the App Store, plan for **Guideline 4.2** (see `docs/MOBILE.md`). A native
app with haptics, the share sheet and offline storage clears it much more
easily than a web wrapper, and a home-screen widget ("12 / 31") would settle
it. The privacy manifest (`PrivacyInfo.xcprivacy`) declares no data
collection and the UserDefaults reason code CA92.1.
