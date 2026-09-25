import SwiftUI

/// How a badge is shown — docs/specs/design-system.md#pin-badge.
struct PinLook: Equatable {
    var saturation = 1.0
    var opacity = 1.0
    var brightness = 0.0
    var shadow = false

    static let full = PinLook()
    static let listUnpinned = PinLook(saturation: 0, opacity: 0.38)
    static let detailUnpinned = PinLook(saturation: 0.15, opacity: 0.5)
    static let boardPinned = PinLook(shadow: true)
    static let boardUnpinned = PinLook(saturation: 0, opacity: 0.32, brightness: 0.12)
}

/// Pointy-top hexagon on the 64-unit badge grid, scaled by `unit`.
private func hexagon(radius: CGFloat, unit: CGFloat) -> Path {
    var path = Path()
    for i in 0..<6 {
        let angle = (60 * Double(i) - 90) * .pi / 180
        let point = CGPoint(x: (32 + radius * cos(angle)) * unit, y: (32 + radius * sin(angle)) * unit)
        if i == 0 { path.move(to: point) } else { path.addLine(to: point) }
    }
    path.closeSubpath()
    return path
}

private extension Glyph {
    /// SF Symbols stand in for the web's Lucide glyphs on iOS; they only show
    /// for a park without artwork, which today is none.
    var symbol: String {
        switch self {
        case .mtn: "mountain.2"
        case .pine: "tree"
        case .wave: "water.waves"
        case .leaf: "leaf"
        case .sun: "sun.max"
        }
    }
}

/// The enamel pin: a brushed-gold hexagonal rim around the park's artwork
/// (or a placeholder glyph). Drawn on a 64-unit grid scaled to the frame.
struct PinBadge: View {
    let park: Park
    var look: PinLook = .full
    @Environment(\.repository) private var repository

    var body: some View {
        let palette = Color.pinPalette[((park.color % 6) + 6) % 6]
        let artwork = repository.artwork(park)

        GeometryReader { geo in
            let unit = min(geo.size.width, geo.size.height) / 64
            ZStack {
                hexagon(radius: 30, unit: unit)
                    .fill(LinearGradient(
                        stops: [
                            .init(color: .gold100, location: 0),
                            .init(color: .gold300, location: 0.28),
                            .init(color: .gold500, location: 0.55),
                            .init(color: .gold600, location: 0.8),
                            .init(color: .gold800, location: 1),
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ))

                let enamel = hexagon(radius: 26, unit: unit)
                if let artwork {
                    // Cover-fit the square artwork to the enamel's bounding box.
                    Image(uiImage: artwork)
                        .resizable()
                        .interpolation(.high)
                        .frame(width: 52 * unit, height: 52 * unit)
                        .position(x: 32 * unit, y: 32 * unit)
                        .clipShape(enamel)
                } else {
                    enamel.fill(palette.light)
                    Image(systemName: park.glyph.symbol)
                        .font(.system(size: 22 * unit, weight: .semibold))
                        .foregroundStyle(palette.dark)
                        .position(x: 32 * unit, y: 32 * unit)
                }
                enamel.stroke(Color.gold700, lineWidth: 0.7 * unit)
            }
            .frame(width: geo.size.width, height: geo.size.height)
        }
        .aspectRatio(1, contentMode: .fit)
        .saturation(look.saturation)
        .brightness(look.brightness)
        // Fade the badge as one flat image, as CSS opacity does.
        .compositingGroup()
        .opacity(look.opacity)
        .shadow(color: .black.opacity(look.shadow ? 0.4 : 0), radius: 2, y: 2)
        .accessibilityHidden(true)
    }
}
