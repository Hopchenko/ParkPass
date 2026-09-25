import SwiftUI

private struct RepositoryKey: EnvironmentKey {
    static let defaultValue = ParkRepository()
}

extension EnvironmentValues {
    /// The park dataset and artwork cache, provided once at the root.
    var repository: ParkRepository {
        get { self[RepositoryKey.self] }
        set { self[RepositoryKey.self] = newValue }
    }
}

/// A small rounded tag: count chips, region/year/area tags.
struct Pill: View {
    let text: String
    var background: Color = .accent100
    var foreground: Color = .accent800

    var body: some View {
        Text(text)
            .font(.figtree(11))
            .tracking(0.22)
            .foregroundStyle(foreground)
            .padding(.horizontal, 10)
            .padding(.vertical, 3)
            .background(background, in: Capsule())
    }
}

/// Title on the left, count chip on the right — map, board.
struct ScreenHeader: View {
    let title: String
    let count: String

    var body: some View {
        HStack {
            Text(title).font(.heading(27)).foregroundStyle(Color.ink)
            Spacer()
            Pill(text: count)
        }
        .padding(.horizontal, 18)
        .padding(.top, 16)
        .padding(.bottom, 12)
    }
}

/// Uppercase field label on the You tab.
struct FieldLabel: View {
    let text: String

    var body: some View {
        Text(text.uppercased())
            .font(.figtree(11.5, .bold))
            .tracking(0.7)
            .foregroundStyle(Color.neutral600)
    }
}
