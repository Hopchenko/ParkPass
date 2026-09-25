import Foundation

/// The two UI languages. Swedish is the default — docs/specs/i18n.md.
public enum Lang: String, Codable, CaseIterable, Sendable {
    case sv, en
}

public struct Localized: Codable, Hashable, Sendable {
    public let sv: String
    public let en: String

    public subscript(lang: Lang) -> String {
        lang == .sv ? sv : en
    }
}

/// Placeholder pin glyph, drawn when a park has no artwork yet.
public enum Glyph: String, Codable, Sendable {
    case mtn, pine, wave, leaf, sun
}

/// One national park, as exported to shared/parks.json from parks.ts.
public struct Park: Codable, Hashable, Identifiable, Sendable {
    public let slug: String
    public let name: String
    public let sami: String?
    public let year: Int
    /// Area in km²; may be fractional.
    public let area: Double
    public let glyph: Glyph
    /// Index into the placeholder palette, mod 6.
    public let color: Int
    public let region: Localized
    public let description: Localized
    public let officialUrl: Localized
    public let hasArtwork: Bool

    public var id: String { slug }
}

public enum ParkData {
    private struct File: Decodable { let parks: [Park] }

    /// Parses shared/parks.json. Array order is display order.
    public static func parse(_ data: Data) throws -> [Park] {
        try JSONDecoder().decode(File.self, from: data).parks
    }
}
