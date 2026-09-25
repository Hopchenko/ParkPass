import SwiftUI

/// 16 particles, laid out exactly as ConfettiBurst.tsx — docs/specs/park-detail.md.
struct Confetti: View {
    /// Seconds since the burst started.
    let elapsed: TimeInterval

    private struct Dot {
        let size: Double
        let round: Bool
        let color: Color
        let dx: Double
        let dy: Double
        let duration: Double
        let delay: Double

        init(_ i: Int) {
            let colors: [UInt32] = [0xC67139, 0x7A8A5E, 0xF6A06B, 0xAEBF92, 0x8C491A, 0xE1EECC]
            let angle = Double(i) / 16 * .pi * 2 + Double(i % 3) * 0.21
            let dist = Double(78 + (i % 5) * 14)
            size = Double(6 + (i % 4) * 2)
            round = i % 2 == 1
            color = Color(hex: colors[i % 6])
            dx = (cos(angle) * dist).rounded()
            dy = (sin(angle) * dist - 24).rounded()
            duration = 0.65 + Double(i % 4) * 0.09
            delay = Double(i % 5) * 0.03
        }
    }

    private static let dots = (0..<16).map(Dot.init)

    /// CSS `ease-out` = cubic-bezier(0,0,.58,1).
    private static let easeOut = UnitCurve.bezier(startControlPoint: UnitPoint(x: 0, y: 0), endControlPoint: UnitPoint(x: 0.58, y: 1))

    var body: some View {
        Canvas { context, size in
            // Radiates from 45% down the pin area; before its delay each dot
            // waits at the origin, as `animation-fill-mode: both` does.
            let origin = CGPoint(x: size.width / 2, y: size.height * 0.45)
            for d in Self.dots {
                let local = min(1, max(0, (elapsed - d.delay) / d.duration))
                let e = Self.easeOut.value(at: local)
                let alpha = 1 - e
                guard alpha > 0 else { continue }
                let side = d.size * (1 - 0.85 * e)
                let center = CGPoint(x: origin.x + d.dx * e, y: origin.y + d.dy * e)
                let rect = CGRect(x: center.x - side / 2, y: center.y - side / 2, width: side, height: side)
                let shape = d.round
                    ? Path(ellipseIn: rect)
                    : Path(roundedRect: rect, cornerRadius: 3 * (1 - 0.85 * e))
                context.fill(shape, with: .color(d.color.opacity(alpha)))
            }
        }
    }
}
