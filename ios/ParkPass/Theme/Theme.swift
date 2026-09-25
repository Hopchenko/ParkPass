import CoreText
import SwiftUI

/// Organic design tokens — docs/specs/design-system.md, from globals.css.
extension Color {
    init(hex: UInt32, alpha: Double = 1) {
        self.init(
            .sRGB,
            red: Double((hex >> 16) & 0xFF) / 255,
            green: Double((hex >> 8) & 0xFF) / 255,
            blue: Double(hex & 0xFF) / 255,
            opacity: alpha
        )
    }

    static let ground = Color(hex: 0xF5EAD8)
    static let surface = Color(hex: 0xEBDDC5)
    static let ink = Color(hex: 0x201E1D)
    static let divider = Color(hex: 0x201E1D, alpha: 0.16)

    static let accent = Color(hex: 0xC67139)
    static let accent100 = Color(hex: 0xFFF2EB)
    static let accent600 = Color(hex: 0xB2622D)
    static let accent700 = Color(hex: 0x8C491A)
    static let accent800 = Color(hex: 0x643312)

    static let sage100 = Color(hex: 0xF0FAE1)
    static let sage200 = Color(hex: 0xE1EECC)
    static let sage400 = Color(hex: 0xAEBF92)
    static let sage700 = Color(hex: 0x56633F)
    static let sage800 = Color(hex: 0x3D472B)
    static let sage900 = Color(hex: 0x272E1B)

    static let gold100 = Color(hex: 0xFDF3CD)
    static let gold300 = Color(hex: 0xE8C86E)
    static let gold500 = Color(hex: 0xC2912C)
    static let gold600 = Color(hex: 0xA5761F)
    static let gold700 = Color(hex: 0x855D18)
    static let gold800 = Color(hex: 0x654613)

    static let neutral100 = Color(hex: 0xF9F4ED)
    static let neutral300 = Color(hex: 0xDCD3C4)
    static let neutral400 = Color(hex: 0xC0B6A5)
    static let neutral500 = Color(hex: 0xA19786)
    static let neutral600 = Color(hex: 0x82796A)
    static let neutral700 = Color(hex: 0x645C50)
    static let neutral800 = Color(hex: 0x474238)

    /// Placeholder pin palette (main, light, dark), indexed by Park.color mod 6.
    static let pinPalette: [(main: Color, light: Color, dark: Color)] = [
        (Color(hex: 0xC67139), Color(hex: 0xFFE1D0), Color(hex: 0x8C491A)),
        (Color(hex: 0x7A8A5E), Color(hex: 0xE1EECC), Color(hex: 0x3D472B)),
        (Color(hex: 0xD67F48), Color(hex: 0xFFF2EB), Color(hex: 0x8C491A)),
        (Color(hex: 0x8FA073), Color(hex: 0xF0FAE1), Color(hex: 0x3D472B)),
        (Color(hex: 0xB2622D), Color(hex: 0xFFC6A5), Color(hex: 0x643312)),
        (Color(hex: 0x56633F), Color(hex: 0xCCDBB2), Color(hex: 0x272E1B)),
    ]
}

extension Font {
    /// Chunky display face for headings and buttons.
    static func heading(_ size: CGFloat) -> Font { .custom("Caprasimo", size: size) }

    /// Figtree is a variable font; `.weight` picks the instance.
    static func figtree(_ size: CGFloat, _ weight: Font.Weight = .regular) -> Font {
        .custom("Figtree", size: size).weight(weight)
    }
}

enum Fonts {
    /// Registers the bundled fonts once at launch, so no Info.plist list is needed.
    static func register() {
        for name in ["Caprasimo-Regular", "Figtree-Variable"] {
            let url = Bundle.main.url(forResource: name, withExtension: "ttf")
                ?? Bundle.main.url(forResource: name, withExtension: "ttf", subdirectory: "Fonts")
            if let url {
                CTFontManagerRegisterFontsForURL(url as CFURL, .process, nil)
            }
        }
    }
}
