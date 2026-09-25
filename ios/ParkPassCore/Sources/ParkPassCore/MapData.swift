import Foundation

/// Hex-grid map of Sweden (shared/map.json). Every hexagon is congruent and
/// stored as its top-left anchor vertex — docs/specs/data.md.
public struct MapData: Decodable, Sendable {
    public struct ViewBox: Decodable, Sendable {
        public let width: Double
        public let height: Double
    }

    public struct ParkHex: Decodable, Sendable {
        public let slug: String
        public let x: Double
        public let y: Double
    }

    public let viewBox: ViewBox
    public let land: [[Double]]
    public let parks: [ParkHex]

    public static func parse(_ data: Data) throws -> MapData {
        try JSONDecoder().decode(MapData.self, from: data)
    }

    /// Corner offsets from a hex's anchor vertex, in drawing order.
    public static let hexCorners: [(Double, Double)] = [
        (0, 0), (0, 12.45), (10.78, 18.68), (21.56, 12.45), (21.56, 0), (10.78, -6.22),
    ]

    /// Offset from the anchor vertex to the hex centre.
    public static let centerOffset = (x: 10.78, y: 6.23)

    /// Centre-to-corner distance, used as the tap radius.
    public static let circumradius = 12.45
}
