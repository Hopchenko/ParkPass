import Foundation

/// The web app's UI strings (parkpass-web/messages/{sv,en}.json), read as-is
/// so iOS never keeps its own copy of the wording. Keys are flattened to
/// "group.key", matching the web's `useTranslations("group")("key")`.
public enum Messages {
    public static func flatten(_ data: Data) throws -> [String: String] {
        let root = try JSONSerialization.jsonObject(with: data) as? [String: Any] ?? [:]
        var out: [String: String] = [:]
        func walk(_ node: [String: Any], _ path: String) {
            for (key, value) in node {
                let full = path.isEmpty ? key : "\(path).\(key)"
                if let text = value as? String {
                    out[full] = text
                } else if let child = value as? [String: Any] {
                    walk(child, full)
                }
            }
        }
        walk(root, "")
        return out
    }
}

/// The slice of ICU MessageFormat the catalogue uses: `{name}` arguments and
/// `{name, plural, one {…} other {…}}` with `#` for the number. Swedish and
/// English share the same rule — "one" is exactly 1.
public enum MessageFormat {
    public static func format(_ pattern: String, _ args: [String: String] = [:]) -> String {
        format(Array(pattern), args, pound: nil)
    }

    private static func format(_ chars: [Character], _ args: [String: String], pound: String?) -> String {
        var out = ""
        var i = 0
        while i < chars.count {
            let ch = chars[i]
            if ch == "{", let end = matchingBrace(chars, from: i) {
                out += argument(Array(chars[(i + 1)..<end]), args)
                i = end + 1
            } else if ch == "#", let pound {
                out += pound
                i += 1
            } else {
                out.append(ch)
                i += 1
            }
        }
        return out
    }

    private static func matchingBrace(_ chars: [Character], from start: Int) -> Int? {
        var depth = 0
        for j in start..<chars.count {
            if chars[j] == "{" { depth += 1 }
            if chars[j] == "}" {
                depth -= 1
                if depth == 0 { return j }
            }
        }
        return nil
    }

    private static func argument(_ inner: [Character], _ args: [String: String]) -> String {
        let parts = String(inner).split(separator: ",", maxSplits: 2, omittingEmptySubsequences: false)
        let name = parts[0].trimmingCharacters(in: .whitespaces)
        guard parts.count == 3, parts[1].trimmingCharacters(in: .whitespaces) == "plural" else {
            return args[name] ?? "{\(name)}"
        }
        let value = args[name] ?? ""
        let options = pluralOptions(Array(parts[2]))
        let selector = Int(value) == 1 ? "one" : "other"
        let chosen = options["=\(value)"] ?? options[selector] ?? options["other"] ?? ""
        return format(Array(chosen), args, pound: value)
    }

    /// Parses `one {…} other {…}` into selector → message.
    private static func pluralOptions(_ chars: [Character]) -> [String: String] {
        var options: [String: String] = [:]
        var i = 0
        while i < chars.count {
            while i < chars.count, chars[i].isWhitespace { i += 1 }
            var selector = ""
            while i < chars.count, chars[i] != "{", !chars[i].isWhitespace {
                selector.append(chars[i])
                i += 1
            }
            while i < chars.count, chars[i] != "{" { i += 1 }
            guard i < chars.count, let end = matchingBrace(chars, from: i) else { break }
            options[selector] = String(chars[(i + 1)..<end])
            i = end + 1
        }
        return options
    }
}
