import Foundation
import Observation

/// UI strings, read straight from the web app's catalogue
/// (parkpass-web/messages/{sv,en}.json, copied into the bundle at build
/// time) and formatted with the ICU subset in MessageFormat.
///
/// The default language follows the device — English if the phone prefers
/// English, otherwise Swedish — and the You tab can override it; the choice
/// is remembered. See docs/specs/i18n.md.
@Observable
final class L10n {
    private static let key = "parkpass-lang"

    var lang: Lang {
        didSet { UserDefaults.standard.set(lang.rawValue, forKey: Self.key) }
    }

    private let tables: [Lang: [String: String]]

    /// Native-only strings the web catalogue doesn't need.
    private static let native: [Lang: [String: String]] = [
        .sv: [
            "you.share": "Dela koden",
            "you.paste": "Klistra in",
            "you.version": "Version {version}",
        ],
        .en: [
            "you.share": "Share code",
            "you.paste": "Paste",
            "you.version": "Version {version}",
        ],
    ]

    init(bundle: Bundle = .main) {
        var tables: [Lang: [String: String]] = [:]
        for lang in Lang.allCases {
            let url = bundle.url(forResource: lang.rawValue, withExtension: "json", subdirectory: "messages")
            let web = url.flatMap { try? Data(contentsOf: $0) }.flatMap { try? Messages.flatten($0) } ?? [:]
            tables[lang] = web.merging(Self.native[lang] ?? [:]) { web, _ in web }
        }
        self.tables = tables

        if let saved = UserDefaults.standard.string(forKey: Self.key), let lang = Lang(rawValue: saved) {
            self.lang = lang
        } else {
            let preferred = Locale.preferredLanguages.first?.lowercased() ?? "sv"
            self.lang = preferred.hasPrefix("en") ? .en : .sv
        }
    }

    /// Looks up `group.key` and fills in ICU arguments.
    func t(_ key: String, _ args: [String: String] = [:]) -> String {
        guard let pattern = tables[lang]?[key] else { return key }
        return MessageFormat.format(pattern, args)
    }

    var locale: Locale {
        Locale(identifier: lang == .sv ? "sv_SE" : "en_GB")
    }

    /// "24 juli 2026" / "24 Jul 2026" — a calendar date, no time-zone maths.
    func visitDate(_ iso: String) -> String {
        guard let date = Self.parse(iso) else { return iso }
        let f = DateFormatter()
        f.locale = locale
        f.dateFormat = "d MMM yyyy"
        return f.string(from: date)
    }

    /// "24 JUL 2026" — short, uppercase, no periods, for the rubber stamp.
    func stampDate(_ iso: String) -> String {
        guard let date = Self.parse(iso) else { return iso }
        let f = DateFormatter()
        f.locale = locale
        f.dateFormat = "dd MMM yyyy"
        return f.string(from: date).replacingOccurrences(of: ".", with: "").uppercased(with: locale)
    }

    /// "1 278" / "1,278"; fractional areas keep one decimal.
    func area(_ area: Double) -> String {
        let f = NumberFormatter()
        f.locale = locale
        f.numberStyle = .decimal
        f.maximumFractionDigits = 1
        return f.string(from: NSNumber(value: area)) ?? String(area)
    }

    /// Parsed at local noon so no time zone can move it to another day.
    private static func parse(_ iso: String) -> Date? {
        let parts = iso.split(separator: "-").compactMap { Int($0) }
        guard parts.count == 3 else { return nil }
        return Calendar.current.date(from: DateComponents(year: parts[0], month: parts[1], day: parts[2], hour: 12))
    }
}
