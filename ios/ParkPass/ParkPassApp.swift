import SwiftUI

@main
struct ParkPassApp: App {
    @State private var visits = VisitStore()
    @State private var l10n = L10n()
    private let repository = ParkRepository()

    init() {
        Fonts.register()
    }

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(visits)
                .environment(l10n)
                .environment(\.repository, repository)
                // Light only, by design — the pins and fabric are made for the paper ground.
                .preferredColorScheme(.light)
                .tint(.accent700)
        }
    }
}

/// The four tabs — docs/specs/navigation.md. System TabView and
/// NavigationStack, so iOS draws them natively (Liquid Glass on iOS 26) and
/// the back button and swipe-back come for free. Each tab has its own
/// stack, so a park opened from the map returns to the map.
struct RootView: View {
    @Environment(L10n.self) private var l10n
    @State private var tab = AppTab.parks

    enum AppTab: Hashable { case parks, map, board, you }

    var body: some View {
        TabView(selection: $tab) {
            ParkStack(title: l10n.t("tabs.parks")) { ParkListView() }
                .tabItem { Label(l10n.t("tabs.parks"), systemImage: "tree") }
                .tag(AppTab.parks)
            ParkStack(title: l10n.t("tabs.map")) { SwedenMapView() }
                .tabItem { Label(l10n.t("tabs.map"), systemImage: "map") }
                .tag(AppTab.map)
            ParkStack(title: l10n.t("tabs.board")) { PinBoardView() }
                .tabItem { Label(l10n.t("tabs.board"), systemImage: "medal") }
                .tag(AppTab.board)
            NavigationStack { ProfileView().toolbar(.hidden, for: .navigationBar) }
                .tabItem { Label(l10n.t("tabs.you"), systemImage: "person") }
                .tag(AppTab.you)
        }
    }
}

/// A tab's navigation stack: the root hides the bar (screens draw their own
/// headers) but keeps its title, which becomes the back button's label on a
/// park page — "‹ Map", as the web's BackLink does.
private struct ParkStack<Root: View>: View {
    let title: String
    @ViewBuilder let root: () -> Root
    @Environment(\.repository) private var repository

    var body: some View {
        NavigationStack {
            root()
                .navigationTitle(title)
                .toolbar(.hidden, for: .navigationBar)
                .background(Color.ground)
                .navigationDestination(for: ParkRoute.self) { route in
                    if let park = repository.park(route.slug) {
                        ParkDetailView(park: park)
                    }
                }
        }
    }
}

/// Navigation value for a park page.
struct ParkRoute: Hashable {
    let slug: String
}
