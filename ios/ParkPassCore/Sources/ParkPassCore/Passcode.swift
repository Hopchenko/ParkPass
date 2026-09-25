import Foundation

/// Transfer codes: the whole pin board packs into a string you paste on
/// another device. A line-for-line port of parkpass-web/src/lib/passcode.ts
/// (and android/core/…/Passcode.kt) — all three must agree bit for bit,
/// which PasscodeTests proves against vectors produced by the web codec.
/// Wire format: docs/specs/transfer-codes.md.
///
///     [4 bits version][W bits presence bitmap][14 bits × each set bit]
public enum Passcode {
    /// Frozen slug order — codes are positional, so this list is APPEND-ONLY.
    /// Reordering or deleting an entry silently redirects every code already
    /// written down to the wrong parks.
    public static let codeOrder: [String] = [
        "abisko", "vadvetjakka", "stora-sjofallet", "padjelanta", "sarek",
        "muddus", "pieljekaise", "haparanda-skargard", "bjornlandet", "skuleskogen",
        "sonfjallet", "tofsingdalen", "fulufjallet", "hamra", "farnebofjarden",
        "garphyttan", "tyresta", "angso", "namdoskargarden", "norra-kvill",
        "store-mosse", "bla-jungfrun", "gotska-sandon", "asnen", "stenshuvud",
        "dalby-soderskog", "soderasen", "kosterhavet", "tiveden", "djuro",
        "tresticklan",
    ]

    public enum DecodeError: String, Error, Equatable, Sendable {
        case empty, charset, length, checksum, version
    }

    private static let version = 1
    private static let versionBits = 4
    /// Bitmap width per version. A 32nd park means a version 2 — never widen 1.
    private static let bitmapWidth: [Int: Int] = [1: 31]
    private static let dateBits = 14
    private static let maxDay = (1 << dateBits) - 1
    /// Reserved: "pinned, but the stored date was unreadable".
    private static let unknownDay = 0
    /// Crockford base32 — no I, L, O or U, so 1/I and 0/O can't be fat-fingered.
    private static let alphabet = Array("0123456789ABCDEFGHJKMNPQRSTVWXYZ")
    private static let prefix = "PARKPASS"
    private static let checksumChars = 2
    private static let checksumBits = 10

    private static let charValues: [Character: Int] = {
        var map: [Character: Int] = [:]
        for (i, ch) in alphabet.enumerated() { map[ch] = i }
        // Crockford's forgiving aliases for the characters it dropped.
        map["O"] = 0
        map["I"] = 1
        map["L"] = 1
        return map
    }()

    /// Day arithmetic happens on UTC calendar days, like Date.UTC in the web codec.
    private static let utc: Calendar = {
        var c = Calendar(identifier: .gregorian)
        c.timeZone = TimeZone(identifier: "UTC")!
        return c
    }()

    private static let epoch = utc.date(from: DateComponents(year: 2020, month: 1, day: 1))!

    private static func pushBits(_ bits: inout [Int], _ value: Int, _ width: Int) {
        for i in stride(from: width - 1, through: 0, by: -1) { bits.append((value >> i) & 1) }
    }

    private static func readBits(_ bits: [Int], _ offset: Int, _ width: Int) -> Int {
        var value = 0
        for i in 0..<width { value = (value << 1) | bits[offset + i] }
        return value
    }

    /// CRC-16/CCITT-FALSE over the code's 5-bit values, so the check is
    /// independent of the payload layout — a code from a future version still
    /// fails on its version, not on a bogus checksum.
    private static func crc16(_ values: [Int]) -> Int {
        var crc = 0xFFFF
        for value in values {
            crc ^= (value << 8) & 0xFFFF
            for _ in 0..<8 {
                crc = crc & 0x8000 != 0 ? ((crc << 1) ^ 0x1021) & 0xFFFF : (crc << 1) & 0xFFFF
            }
        }
        return crc
    }

    private static func dayFromISO(_ iso: String) -> Int {
        let parts = iso.split(separator: "-", omittingEmptySubsequences: false)
        guard parts.count == 3, parts[0].count == 4, parts[1].count == 2, parts[2].count == 2,
              parts.allSatisfy({ $0.allSatisfy(\.isASCII) && $0.allSatisfy(\.isNumber) }),
              let y = Int(parts[0]), let m = Int(parts[1]), let d = Int(parts[2]),
              let date = utc.date(from: DateComponents(year: y, month: m, day: d))
        else { return unknownDay }
        // Rejects the likes of 2026-02-31, which would otherwise roll over.
        let back = utc.dateComponents([.year, .month, .day], from: date)
        guard back.year == y, back.month == m, back.day == d else { return unknownDay }
        let day = Int((date.timeIntervalSince(epoch) / 86_400).rounded())
        return min(maxDay, max(1, day))
    }

    private static func isoFromDay(_ day: Int, today: () -> String) -> String {
        if day == unknownDay { return today() }
        let date = utc.date(byAdding: .day, value: day, to: epoch)!
        let c = utc.dateComponents([.year, .month, .day], from: date)
        return String(format: "%04d-%02d-%02d", c.year!, c.month!, c.day!)
    }

    /// Packs the visited map into a shareable code, grouped for readability.
    public static func encode(_ visited: VisitedMap) -> String {
        let width = bitmapWidth[version]!
        var bits: [Int] = []
        pushBits(&bits, version, versionBits)

        var days: [Int] = []
        for i in 0..<width {
            if let iso = visited[codeOrder[i]] {
                bits.append(1)
                days.append(dayFromISO(iso))
            } else {
                bits.append(0)
            }
        }
        for day in days { pushBits(&bits, day, dateBits) }

        while bits.count % 5 != 0 { bits.append(0) }

        var values: [Int] = []
        for i in stride(from: 0, to: bits.count, by: 5) { values.append(readBits(bits, i, 5)) }

        let checksum = crc16(values) & ((1 << checksumBits) - 1)
        values.append((checksum >> 5) & 31)
        values.append(checksum & 31)

        let body = values.map { alphabet[$0] }
        var groups: [String] = []
        for start in stride(from: 0, to: body.count, by: 4) {
            groups.append(String(body[start..<min(start + 4, body.count)]))
        }
        return "\(prefix)-" + groups.joined(separator: "-")
    }

    /// Parses a pasted code. Tolerates lowercase, a missing prefix, and any
    /// spacing or punctuation the clipboard picked up on the way.
    ///
    /// - Parameters:
    ///   - knownSlugs: parks in the current dataset; others are dropped so a
    ///     removed park can't resurrect itself in storage.
    ///   - today: the local date used for the reserved "unknown date" day.
    public static func decode(
        _ raw: String,
        knownSlugs: Set<String> = Set(codeOrder),
        today: () -> String = { Visits.todayISO() }
    ) -> Result<VisitedMap, DecodeError> {
        let cleaned = String(raw.uppercased().filter { ch in
            ch.isASCII && (ch.isNumber || ch.isLetter)
        })
        let body = cleaned.hasPrefix(prefix) ? String(cleaned.dropFirst(prefix.count)) : cleaned

        if body.isEmpty {
            if raw.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { return .failure(.empty) }
            // "PARKPASS-" on its own is a truncated code; anything else is not one.
            return .failure(cleaned.isEmpty ? .charset : .length)
        }

        var values: [Int] = []
        for ch in body {
            guard let value = charValues[ch] else { return .failure(.charset) }
            values.append(value)
        }
        if values.count <= checksumChars { return .failure(.length) }

        let data = Array(values.dropLast(checksumChars))
        let hi = values[values.count - 2]
        let lo = values[values.count - 1]
        let expected = crc16(data) & ((1 << checksumBits) - 1)
        if ((hi << 5) | lo) != expected { return .failure(.checksum) }

        var bits: [Int] = []
        for value in data { pushBits(&bits, value, 5) }

        if bits.count < versionBits { return .failure(.length) }
        let codeVersion = readBits(bits, 0, versionBits)
        guard let width = bitmapWidth[codeVersion] else { return .failure(.version) }
        if bits.count < versionBits + width { return .failure(.length) }

        let pinned = (0..<width).filter { bits[versionBits + $0] == 1 }.map { codeOrder[$0] }

        var offset = versionBits + width
        if bits.count < offset + pinned.count * dateBits { return .failure(.length) }

        var visits: VisitedMap = [:]
        for slug in pinned {
            let day = readBits(bits, offset, dateBits)
            offset += dateBits
            if knownSlugs.contains(slug) { visits[slug] = isoFromDay(day, today: today) }
        }
        return .success(visits)
    }
}
