import Foundation
import XCTest
@testable import ParkPassCore

/// The repo root, found from this file: ios/ParkPassCore/Tests/ParkPassCoreTests/…
private let repo = URL(fileURLWithPath: #filePath)
    .deletingLastPathComponent() // ParkPassCoreTests
    .deletingLastPathComponent() // Tests
    .deletingLastPathComponent() // ParkPassCore
    .deletingLastPathComponent() // ios
    .deletingLastPathComponent() // repo

private func fixture(_ path: String) throws -> Data {
    try Data(contentsOf: repo.appendingPathComponent(path))
}

/// Replays shared/passcode-vectors.json, written by the web app's own codec
/// (npm run export:shared). If these pass, codes move between iPhone,
/// Android and the browser.
final class PasscodeTests: XCTestCase {
    private var vectors: [String: Any] = [:]

    override func setUpWithError() throws {
        vectors = try JSONSerialization.jsonObject(with: fixture("shared/passcode-vectors.json")) as! [String: Any]
    }

    func testCodeOrderMatchesWeb() {
        XCTAssertEqual(vectors["codeOrder"] as? [String], Passcode.codeOrder)
    }

    func testEveryParkHasACodeSlot() throws {
        let parks = try ParkData.parse(fixture("shared/parks.json"))
        XCTAssertEqual(Set(parks.map(\.slug)).subtracting(Passcode.codeOrder), [])
    }

    func testEncodesAndDecodesExactlyLikeWeb() {
        for case let v as [String: Any] in vectors["encode"] as! [Any] {
            let name = v["name"] as! String
            let visits = v["visits"] as! [String: String]
            let code = v["code"] as! String
            XCTAssertEqual(Passcode.encode(visits), code, name)
            XCTAssertEqual(try Passcode.decode(code).get(), v["decoded"] as! [String: String], name)
        }
    }

    func testHandlesMessyAndBrokenInputLikeWeb() {
        for case let v as [String: Any] in vectors["decode"] as! [Any] {
            let name = v["name"] as! String
            let result = v["result"] as! [String: Any]
            let actual = Passcode.decode(v["input"] as! String)
            if result["ok"] as! Bool {
                XCTAssertEqual(try actual.get(), result["visits"] as! [String: String], name)
            } else {
                XCTAssertEqual(actual, .failure(Passcode.DecodeError(rawValue: result["error"] as! String)!), name)
            }
        }
    }

    func testUnknownOrImpossibleDateBecomesToday() {
        for bad in ["not-a-date", "2026-02-31"] {
            let code = Passcode.encode(["sarek": bad])
            XCTAssertEqual(try Passcode.decode(code, today: { "2026-09-25" }).get(), ["sarek": "2026-09-25"])
        }
    }

    func testDropsParksNotInTheDataset() {
        let code = Passcode.encode(["sarek": "2024-01-01", "abisko": "2024-01-02"])
        XCTAssertEqual(try Passcode.decode(code, knownSlugs: ["abisko"]).get(), ["abisko": "2024-01-02"])
    }
}

final class DataTests: XCTestCase {
    func testParsesAll31ParksAndTheMap() throws {
        let parks = try ParkData.parse(fixture("shared/parks.json"))
        XCTAssertEqual(parks.count, 31)
        XCTAssertEqual(parks.first { $0.slug == "muddus" }?.sami, "Muttos")
        XCTAssertEqual(parks.first { $0.slug == "garphyttan" }?.area, 1.1)

        let map = try MapData.parse(fixture("shared/map.json"))
        XCTAssertEqual(Set(map.parks.map(\.slug)), Set(parks.map(\.slug)))
    }
}

final class VisitsTests: XCTestCase {
    func testMergeIsAUnionWhereTheEarlierVisitWins() {
        let result = Visits.merge(
            ["abisko": "2025-07-01", "sarek": "2024-08-01"],
            ["abisko": "2024-06-01", "sarek": "2025-01-01", "tyresta": "2023-05-05"]
        )
        XCTAssertEqual(result.visits, ["abisko": "2024-06-01", "sarek": "2024-08-01", "tyresta": "2023-05-05"])
        XCTAssertEqual(result.added, 1)
        XCTAssertEqual(result.updated, 1)
    }

    func testJSONRoundTripsAndToleratesGarbage() {
        let board = ["abisko": "2025-07-01", "bla-jungfrun": "2020-01-02"]
        XCTAssertEqual(Visits.fromJSON(Visits.toJSON(board)), board)
        XCTAssertEqual(Visits.fromJSON("{not json"), [:])
        XCTAssertEqual(Visits.fromJSON("[1,2]"), [:])
        XCTAssertEqual(Visits.fromJSON(#"{"a":"2020-01-02","b":5}"#), ["a": "2020-01-02"])
    }
}

/// The formatter against the web's real catalogue, both languages.
final class MessagesTests: XCTestCase {
    func testFormatsTheWebCatalogue() throws {
        let sv = try Messages.flatten(fixture("parkpass-web/messages/sv.json"))
        let en = try Messages.flatten(fixture("parkpass-web/messages/en.json"))
        XCTAssertEqual(Set(sv.keys), Set(en.keys))

        XCTAssertEqual(MessageFormat.format(en["you.toGo"]!, ["count": "1"]), "1 park to go — the diploma is waiting.")
        XCTAssertEqual(MessageFormat.format(en["you.toGo"]!, ["count": "19"]), "19 parks to go — the diploma is waiting.")
        XCTAssertEqual(MessageFormat.format(sv["you.importedPins"]!, ["count": "3"]), "3 nålar tillagda.")
        XCTAssertEqual(MessageFormat.format(sv["you.importedPins"]!, ["count": "1"]), "1 nål tillagd.")
        XCTAssertEqual(
            MessageFormat.format(en["parks.meta"]!, ["region": "Lapland", "year": "1909", "area": "77"]),
            "Lapland · Est. 1909 · 77 km²"
        )
        XCTAssertEqual(MessageFormat.format(en["parks.noResults"]!), #"No parks match — try "Lapland" or "Skåne"."#)
    }
}
