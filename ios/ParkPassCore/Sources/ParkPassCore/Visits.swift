import Foundation

/// slug → ISO date (yyyy-mm-dd) of the visit. See docs/specs/storage.md.
public typealias VisitedMap = [String: String]

public struct MergeResult: Equatable, Sendable {
    public let visits: VisitedMap
    public let added: Int
    public let updated: Int

    public var changed: Bool { added > 0 || updated > 0 }
}

public enum Visits {
    /// Union, never a replacement — importing a transfer code must not be
    /// able to destroy pins this device already has. On a collision the
    /// earlier visit wins (ISO dates sort chronologically as plain strings).
    public static func merge(_ current: VisitedMap, _ incoming: VisitedMap) -> MergeResult {
        var next = current
        var added = 0
        var updated = 0
        for (slug, date) in incoming {
            if let existing = next[slug] {
                if date < existing {
                    next[slug] = date
                    updated += 1
                }
            } else {
                next[slug] = date
                added += 1
            }
        }
        return MergeResult(visits: next, added: added, updated: updated)
    }

    /// Same JSON object the web app keeps in localStorage.
    public static func toJSON(_ visits: VisitedMap) -> String {
        guard let data = try? JSONSerialization.data(withJSONObject: visits, options: [.sortedKeys]) else { return "{}" }
        return String(decoding: data, as: UTF8.self)
    }

    /// Corrupt or non-object values read as an empty board — never throws.
    public static func fromJSON(_ text: String?) -> VisitedMap {
        guard let text, let data = text.data(using: .utf8),
              let object = try? JSONSerialization.jsonObject(with: data) as? [String: Any]
        else { return [:] }
        return object.compactMapValues { $0 as? String }
    }

    /// Today's *local* calendar date — not UTC, or a pin made just after
    /// midnight Swedish time would be stamped yesterday.
    public static func todayISO(calendar: Calendar = .current, now: Date = Date()) -> String {
        let c = calendar.dateComponents([.year, .month, .day], from: now)
        return String(format: "%04d-%02d-%02d", c.year ?? 1970, c.month ?? 1, c.day ?? 1)
    }
}
