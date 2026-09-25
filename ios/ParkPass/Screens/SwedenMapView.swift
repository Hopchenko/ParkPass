import SwiftUI

/// Map tab — docs/specs/map.md.
struct SwedenMapView: View {
    @Environment(VisitStore.self) private var visits
    @Environment(L10n.self) private var l10n
    @Environment(\.repository) private var repository
    @State private var opened: ParkRoute?

    var body: some View {
        let map = repository.map
        let parkHexes = map.parks.filter { repository.park($0.slug) != nil }
        let count = repository.parks.filter { visits.visits[$0.slug] != nil }.count

        ScrollView {
            VStack(spacing: 0) {
                ScreenHeader(title: l10n.t("map.title"), count: l10n.t("map.count", ["count": String(count)]))

                ZStack(alignment: .topLeading) {
                    GeometryReader { geo in
                        let scale = geo.size.width / map.viewBox.width
                        Canvas { context, _ in
                            for point in map.land where point.count == 2 {
                                context.fill(hexagon(point[0], point[1], scale), with: .color(.neutral300))
                            }
                            for hex in parkHexes {
                                let color: Color = visits.visits[hex.slug] != nil ? .accent : .sage400
                                context.fill(hexagon(hex.x, hex.y, scale), with: .color(color))
                            }
                        }
                        .contentShape(Rectangle())
                        .onTapGesture { location in
                            // Nearest park centre within one circumradius — hexes are small.
                            let hit = parkHexes
                                .map { hex -> (String, Double) in
                                    let cx = (hex.x + MapData.centerOffset.x) * scale
                                    let cy = (hex.y + MapData.centerOffset.y) * scale
                                    return (hex.slug, hypot(location.x - cx, location.y - cy))
                                }
                                .filter { $0.1 <= MapData.circumradius * scale }
                                .min { $0.1 < $1.1 }
                            if let hit { opened = ParkRoute(slug: hit.0) }
                        }
                    }
                    .aspectRatio(map.viewBox.width / map.viewBox.height, contentMode: .fit)
                    .accessibilityElement(children: .ignore)
                    .accessibilityLabel(l10n.t("map.mapLabel"))

                    // Sits over the empty north-west of the map.
                    VStack(alignment: .leading, spacing: 6) {
                        legendRow(.accent, l10n.t("map.legendVisited"))
                        legendRow(.sage400, l10n.t("map.legendTodo"))
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                    .background(Color.ground.opacity(0.8), in: RoundedRectangle(cornerRadius: 16))
                    .offset(x: -12, y: 4)
                }
                .padding(.horizontal, 32)
                .padding(.bottom, 16)
            }
        }
        .navigationDestination(item: $opened) { route in
            if let park = repository.park(route.slug) {
                ParkDetailView(park: park)
            }
        }
    }

    /// One hexagon in viewBox units, from its anchor vertex — docs/specs/data.md.
    private func hexagon(_ x: Double, _ y: Double, _ scale: Double) -> Path {
        var path = Path()
        for (i, corner) in MapData.hexCorners.enumerated() {
            let point = CGPoint(x: (x + corner.0) * scale, y: (y + corner.1) * scale)
            if i == 0 { path.move(to: point) } else { path.addLine(to: point) }
        }
        path.closeSubpath()
        return path
    }

    private func legendRow(_ color: Color, _ label: String) -> some View {
        HStack(spacing: 6) {
            Circle().fill(color).frame(width: 12, height: 12)
            Text(label).font(.figtree(12.5)).foregroundStyle(Color.neutral700)
        }
    }
}
