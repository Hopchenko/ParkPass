import SwiftUI

/// The rubber-stamp mark for a visited park, drawn on the web version's
/// 120-unit grid (VisitStamp.tsx). Rotation, opacity and the press animation
/// are applied by the caller.
struct VisitStamp: View {
    let iso: String
    @Environment(L10n.self) private var l10n

    var body: some View {
        let date = l10n.stampDate(iso)
        let visited = l10n.t("detail.stampVisited")

        Canvas { context, size in
            let k = min(size.width, size.height) / 120
            let ink = Color.sage700
            let center = CGPoint(x: 60 * k, y: 60 * k)

            context.stroke(Path(ellipseIn: CGRect(x: 4 * k, y: 4 * k, width: 112 * k, height: 112 * k)), with: .color(ink), lineWidth: 2.6 * k)
            context.stroke(Path(ellipseIn: CGRect(x: 16 * k, y: 16 * k, width: 88 * k, height: 88 * k)), with: .color(ink), lineWidth: 1 * k)

            // "PARKPASS" along the top arc (r = 48), centred on the top.
            let arcFont = Font.figtree(9.5 * k, .bold)
            let tracking = 2.6 * k
            let glyphs = "PARKPASS".map { ch in
                context.resolve(Text(String(ch)).font(arcFont).foregroundColor(ink))
            }
            let widths = glyphs.map { $0.measure(in: size).width }
            let total = widths.reduce(0, +) + tracking * Double(glyphs.count - 1)
            let radius = 48 * k
            var angle = -Double.pi / 2 - (total / radius) / 2
            for (glyph, width) in zip(glyphs, widths) {
                let mid = angle + (width / 2) / radius
                var g = context
                g.translateBy(x: center.x + radius * cos(mid), y: center.y + radius * sin(mid))
                g.rotate(by: .radians(mid + .pi / 2))
                g.draw(glyph, at: .zero, anchor: .bottom)
                angle += (width + tracking) / radius
            }

            func centred(_ text: String, y: Double, font: Font, tracking: Double) {
                let resolved = context.resolve(Text(text).font(font).tracking(tracking).foregroundColor(ink))
                context.draw(resolved, at: CGPoint(x: center.x, y: y * k), anchor: .bottom)
            }
            centred(visited, y: 55, font: .figtree(13 * k, .heavy), tracking: 2.2 * k)
            centred(date, y: 71, font: .figtree(10.5 * k, .bold), tracking: 0.8 * k)
            centred("★★★", y: 86, font: .system(size: 9 * k), tracking: 3 * k)
        }
        .accessibilityElement()
        .accessibilityLabel(l10n.t("detail.stampAlt", ["date": date]))
    }
}
