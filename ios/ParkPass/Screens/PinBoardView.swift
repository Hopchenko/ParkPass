import SwiftUI

/// Pin board tab — docs/specs/pin-board.md.
struct PinBoardView: View {
    @Environment(VisitStore.self) private var visits
    @Environment(L10n.self) private var l10n
    @Environment(\.repository) private var repository

    private let columns = Array(repeating: GridItem(.flexible(), spacing: 6), count: 3)

    var body: some View {
        let count = repository.parks.filter { visits.visits[$0.slug] != nil }.count
        ScrollView {
            VStack(spacing: 0) {
                ScreenHeader(title: l10n.t("board.title"), count: l10n.t("board.count", ["count": String(count)]))

                LazyVGrid(columns: columns, spacing: 18) {
                    ForEach(repository.parks) { park in
                        let pinned = visits.visits[park.slug] != nil
                        NavigationLink(value: ParkRoute(slug: park.slug)) {
                            VStack(spacing: 7) {
                                // Fluid: fills the column, so pins grow with the screen.
                                PinBadge(park: park, look: pinned ? .boardPinned : .boardUnpinned)
                                Text(park.name)
                                    .font(.figtree(10.5, .bold))
                                    .multilineTextAlignment(.center)
                                    .foregroundStyle(pinned ? Color(hex: 0xF5EAD8) : Color(hex: 0xF5EAD8, alpha: 0.45))
                                    .shadow(color: .black.opacity(0.4), radius: 1, y: 1)
                            }
                            .padding(.vertical, 6)
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.horizontal, 8)
                .padding(.top, 20)
                .padding(.bottom, 22)
                .background { Fabric(image: repository.fabric) }
                .clipShape(RoundedRectangle(cornerRadius: 16))
                .padding(10)
                .background { WoodGrain() }
                .clipShape(RoundedRectangle(cornerRadius: 26))
                .shadow(color: Color(hex: 0x2E2B25, alpha: 0.16), radius: 5, y: 3)
                .padding(.horizontal, 14)
                .padding(.top, 4)
                .padding(.bottom, 20)
            }
        }
    }
}

/// CSS repeating-linear-gradient(92deg, …) over a 30pt period, with the
/// 135° sheen and bevel from PinBoard.tsx.
private struct WoodGrain: View {
    var body: some View {
        Canvas { context, size in
            let stops: [Gradient.Stop] = [
                .init(color: Color(hex: 0x8C5A2E), location: 0),
                .init(color: Color(hex: 0x7A4C24), location: 7.0 / 30),
                .init(color: Color(hex: 0x96632F), location: 14.0 / 30),
                .init(color: Color(hex: 0x82522A), location: 22.0 / 30),
                .init(color: Color(hex: 0x8F5D2D), location: 1),
            ]
            var x = 0.0
            while x < size.width {
                let rect = CGRect(x: x, y: 0, width: 30, height: size.height)
                context.fill(Path(rect), with: .linearGradient(
                    Gradient(stops: stops),
                    startPoint: CGPoint(x: x, y: 0),
                    endPoint: CGPoint(x: x + 30, y: 1)
                ))
                x += 30
            }
        }
        .overlay(LinearGradient(colors: [.white.opacity(0.14), .black.opacity(0.16)], startPoint: .topLeading, endPoint: .bottomTrailing))
        .overlay(alignment: .top) { LinearGradient(colors: [.white.opacity(0.3), .clear], startPoint: .top, endPoint: .bottom).frame(height: 3) }
        .overlay(alignment: .bottom) { LinearGradient(colors: [.clear, .black.opacity(0.3)], startPoint: .top, endPoint: .bottom).frame(height: 6) }
    }
}

/// The fabric, tiled at 280pt, with the inset shadow.
private struct Fabric: View {
    let image: UIImage?

    var body: some View {
        ZStack {
            Color(hex: 0x3A4A28)
            if let image {
                Image(uiImage: image).resizable(resizingMode: .tile)
            }
        }
        .overlay(alignment: .top) { LinearGradient(colors: [.black.opacity(0.45), .clear], startPoint: .top, endPoint: .bottom).frame(height: 14) }
        .overlay(alignment: .leading) { LinearGradient(colors: [.black.opacity(0.25), .clear], startPoint: .leading, endPoint: .trailing).frame(width: 10) }
        .overlay(alignment: .trailing) { LinearGradient(colors: [.clear, .black.opacity(0.25)], startPoint: .leading, endPoint: .trailing).frame(width: 10) }
    }
}
