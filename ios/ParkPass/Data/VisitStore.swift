import Foundation
import Observation

/// The pin board: slug → visit date, persisted in UserDefaults as the same
/// JSON object the web app keeps in localStorage. See docs/specs/storage.md.
@Observable
final class VisitStore {
    private static let key = "parkpass-visited"
    private let defaults: UserDefaults

    private(set) var visits: VisitedMap

    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
        visits = Visits.fromJSON(defaults.string(forKey: Self.key))
    }

    /// Pins a park with today's local date.
    func mark(_ slug: String) {
        write(visits.merging([slug: Visits.todayISO()]) { _, new in new })
    }

    func unmark(_ slug: String) {
        var next = visits
        next.removeValue(forKey: slug)
        write(next)
    }

    /// Transfer-code import: a union where the earlier visit wins.
    @discardableResult
    func merge(_ incoming: VisitedMap) -> MergeResult {
        let result = Visits.merge(visits, incoming)
        if result.changed { write(result.visits) }
        return result
    }

    private func write(_ next: VisitedMap) {
        visits = next
        defaults.set(Visits.toJSON(next), forKey: Self.key)
    }
}
