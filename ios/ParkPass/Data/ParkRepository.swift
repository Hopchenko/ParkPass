import Foundation
import UIKit

/// The park dataset, map geometry and pin artwork. All of it is copied into
/// the bundle at build time from shared/ and parkpass-web/public/ by
/// scripts/copy-shared-assets.sh — nothing is kept as a second copy.
final class ParkRepository {
    let parks: [Park]
    let map: MapData
    let slugs: Set<String>
    private let bySlug: [String: Park]
    private let images = NSCache<NSString, UIImage>()

    init(bundle: Bundle = .main) {
        func data(_ name: String, _ ext: String, _ dir: String? = nil) -> Data {
            guard let url = bundle.url(forResource: name, withExtension: ext, subdirectory: dir),
                  let data = try? Data(contentsOf: url)
            else { fatalError("Missing bundled \(dir.map { "\($0)/" } ?? "")\(name).\(ext) — did the Copy shared assets phase run?") }
            return data
        }
        parks = (try? ParkData.parse(data("parks", "json"))) ?? []
        map = try! MapData.parse(data("map", "json"))
        bySlug = Dictionary(uniqueKeysWithValues: parks.map { ($0.slug, $0) })
        slugs = Set(bySlug.keys)
    }

    func park(_ slug: String) -> Park? { bySlug[slug] }

    func artwork(_ park: Park) -> UIImage? {
        park.hasArtwork ? image("pins/\(park.slug)") : nil
    }

    /// The pin-board fabric, scaled so one tile is 280pt wide (CSS `280px repeat`).
    lazy var fabric: UIImage? = {
        guard let raw = image("pinboard-fabric-seamless"), let cg = raw.cgImage else { return nil }
        return UIImage(cgImage: cg, scale: CGFloat(cg.width) / 280, orientation: .up)
    }()

    /// Cached decode of a bundled WebP (iOS decodes WebP natively).
    private func image(_ path: String) -> UIImage? {
        if let cached = images.object(forKey: path as NSString) { return cached }
        let dir = (path as NSString).deletingLastPathComponent
        let name = (path as NSString).lastPathComponent
        guard let url = Bundle.main.url(forResource: name, withExtension: "webp", subdirectory: dir.isEmpty ? nil : dir),
              let image = UIImage(contentsOfFile: url.path)
        else { return nil }
        images.setObject(image, forKey: path as NSString)
        return image
    }
}
